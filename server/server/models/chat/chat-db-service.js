import sql from 'mssql/msnodesqlv8.js';
import UserEncryption from "../../utils/password-hasher.js";
import HistoryDBService from '../history/history-db-service.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';

export default class ChatDBService {
    static async createNewChat(userId1, userId2) {
        try {
            const request = Database.getRequest();

            const insertRoomQuery = `
                INSERT INTO ChatRooms (DateOfCreation)
                OUTPUT INSERTED.Id
                VALUES (GETDATE())
            `;

            const roomResult = await request.query(insertRoomQuery);
            const chatRoomId = roomResult.recordset[0]?.Id;

            if (!chatRoomId) {
                throw new Error('Failed to create chat room');
            }

            Database.addInput(request, 'UserId1', sql.UniqueIdentifier, userId1);
            Database.addInput(request, 'UserId2', sql.UniqueIdentifier, userId2);
            Database.addInput(request, 'ChatRoomId', sql.Int, chatRoomId);

            const insertUserRoomsQuery = `
                INSERT INTO UserChatRooms (UserId, ChatRoomId)
                VALUES (@UserId1, @ChatRoomId),
                       (@UserId2, @ChatRoomId)
            `;
            await request.query(insertUserRoomsQuery);

            return chatRoomId;
        } catch (err) {
            console.error('createNewChat error:', err);
            return null;
        }
    }

    static async fetchUserMessages(userId, friendId = null) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            let query = `
                SELECT m.Id, m.ChatRoomId, m.SenderId, m.Message, m.ExtraInformation, m.DateTimeSent,
                       s.UserId AS SeenByUserId, s.SeenAt
                FROM UserChatRooms ucr
                INNER JOIN Messages m ON ucr.ChatRoomId = m.ChatRoomId
                LEFT JOIN MessageSeen s ON m.Id = s.MessageId
                WHERE ucr.UserId = @UserId
            `;

            if (friendId) {
                // Only messages in the chat room shared with this friend
                Database.addInput(request, 'FriendId', sql.UniqueIdentifier, friendId);
                query += `
                    AND m.ChatRoomId IN (
                        SELECT ChatRoomId 
                        FROM UserChatRooms 
                        WHERE UserId = @FriendId
                    )
                `;
            }

            query += ` ORDER BY m.DateTimeSent ASC`;

            const result = await request.query(query);
            return result.recordset.map(raw => {
                const mapped = {};
                for (const key in raw) {
                    mapped[ObjectMapper.toCamelCase(key)] = raw[key];
                }
                if (mapped.extraInformation) {
                    mapped.extraInformation = JSON.parse(mapped.extraInformation);
                }
                return mapped;
            });
        } catch (err) {
            console.error('fetchUserMessages error:', err);
            return [];
        }
    }

    static async insertMessage(senderId, chatRoomId, message, extraInformation = null) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'SenderId', sql.UniqueIdentifier, senderId);
            Database.addInput(request, 'ChatRoomId', sql.Int, chatRoomId);
            Database.addInput(request, 'Message', sql.NVarChar(sql.MAX), message);
            Database.addInput(request, 'ExtraInformation', sql.VarChar(300), extraInformation ? JSON.stringify(extraInformation) : null);
            Database.addInput(request, 'DateTimeSent', sql.DateTime2, new Date());

            const insertQuery = `
                INSERT INTO Messages (SenderId, ChatRoomId, Message, ExtraInformation, DateTimeSent)
                OUTPUT INSERTED.Id
                VALUES (@SenderId, @ChatRoomId, @Message, @ExtraInformation, @DateTimeSent)
            `;

            const result = await request.query(insertQuery);
            return result.recordset[0]?.Id || null;
        } catch (err) {
            console.error('insertMessage error:', err);
            return null;
        }
    }

    static async markMessagesSeen(userId, messageIds = []) {
        if (!messageIds.length) return 0;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            // Convert array to table-valued parameter or just build query dynamically
            const values = messageIds.map(id => `(${id}, @UserId, GETDATE())`).join(',');
            const query = `
                INSERT INTO MessageSeen (MessageId, UserId, SeenAt)
                VALUES ${values}
                ON DUPLICATE KEY UPDATE SeenAt = GETDATE() -- optional for MSSQL
            `;

            await request.query(query);
            return messageIds.length;
        } catch (err) {
            console.error('markMessagesSeen error:', err);
            return 0;
        }
    }

    static async fetchFriendMessageSummaries(userId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            const query = `
            WITH LastMessages AS (
                SELECT 
                    m.ChatRoomId,
                    m.Id AS MessageId,
                    m.Message,
                    m.DateTimeSent,
                    ROW_NUMBER() OVER (PARTITION BY m.ChatRoomId ORDER BY m.DateTimeSent DESC) AS rn
                FROM Messages m
            )
            SELECT 
                ucr.ChatRoomId,
                ucr2.UserId AS FriendId,
                lm.Message AS LastMessage,
                lm.DateTimeSent AS LastMessageTime,
                SUM(CASE WHEN lm.MessageId IS NOT NULL AND ms.UserId IS NULL THEN 1  ELSE 0  END) AS UnreadCount
            FROM UserChatRooms ucr
            INNER JOIN UserChatRooms ucr2 
                ON ucr.ChatRoomId = ucr2.ChatRoomId AND ucr2.UserId != ucr.UserId
            LEFT JOIN LastMessages lm 
                ON ucr.ChatRoomId = lm.ChatRoomId AND lm.rn = 1
            LEFT JOIN MessageSeen ms 
                ON lm.MessageId = ms.MessageId AND ms.UserId = @UserId
            WHERE ucr.UserId = @UserId
            GROUP BY ucr.ChatRoomId, ucr2.UserId, lm.Message, lm.DateTimeSent
            ORDER BY lm.DateTimeSent DESC
        `;

            const result = await request.query(query);

            return result.recordset.map(raw => {
                const mapped = {};
                for (const key in raw) {
                    mapped[ObjectMapper.toCamelCase(key)] = raw[key];
                }
                return mapped;
            });
        } catch (err) {
            console.error('fetchFriendMessageSummaries error:', err);
            return [];
        }
    }

    static async fetchChatRoomId(userId1, userId2) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId1', sql.UniqueIdentifier, userId1);
            Database.addInput(request, 'UserId2', sql.UniqueIdentifier, userId2);

            const query = `
            SELECT ChatRoomId
            FROM UserChatRooms
            WHERE UserId IN (@UserId1, @UserId2)
            GROUP BY ChatRoomId
            HAVING COUNT(DISTINCT UserId) = 2
        `;

            const result = await request.query(query);
            return result.recordset[0]?.ChatRoomId || null;
        } catch (err) {
            console.error('fetchChatRoomId error:', err);
            return null;
        }
    }
}
