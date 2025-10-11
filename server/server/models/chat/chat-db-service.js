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
            SELECT m.Id,
                   m.ChatRoomId,
                   m.SenderId,
                   m.Message,
                   m.ExtraInformation,
                   m.SeenBy,
                   m.DateTimeSent
            FROM UserChatRooms ucr
            INNER JOIN Messages m ON ucr.ChatRoomId = m.ChatRoomId
            WHERE ucr.UserId = @UserId
        `;

            if (friendId) {
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

                // Parse ExtraInformation JSON if present
                if (mapped.extraInformation) {
                    try {
                        mapped.extraInformation = JSON.parse(mapped.extraInformation);
                    } catch {
                        mapped.extraInformation = null;
                    }
                }

                // Parse SeenBy JSON into an array
                if (mapped.seenBy) {
                    try {
                        mapped.seenBy = JSON.parse(mapped.seenBy);
                    } catch {
                        mapped.seenBy = [];
                    }
                } else {
                    mapped.seenBy = [];
                }

                return mapped;
            });
        } catch (err) {
            console.error('fetchUserMessages error:', err);
            return [];
        }
    }


    static async insertMessage(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'SenderId', sql.UniqueIdentifier, details.senderId);
            Database.addInput(request, 'ChatRoomId', sql.Int, details.chatRoomId);
            Database.addInput(request, 'Message', sql.NVarChar(sql.MAX), details.message);
            Database.addInput(request, 'ExtraInformation', sql.VarChar(300), details.extraInformation ? JSON.stringify(details.extraInformation) : {});
            Database.addInput(request, 'DateTimeSent', sql.DateTime2, details.dateTimeSent || new Date());

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

   static async markMessagesSeen(userIds = [], messageIds = []) {
    if (!userIds.length || !messageIds.length) return;

    try {
        const request = Database.getRequest();
        const idsStr = messageIds.join(',');

        Database.addInput(request, 'UserIdsJson', sql.NVarChar(sql.MAX), JSON.stringify(userIds));
        Database.addInput(request, 'MessageIds', sql.VarChar(sql.MAX), idsStr);

        const query = `
            DECLARE @Messages TABLE (Id INT);
            INSERT INTO @Messages (Id)
            SELECT value FROM STRING_SPLIT(@MessageIds, ',');

            UPDATE Messages
            SET SeenBy = 
                CASE 
                    WHEN SeenBy IS NULL OR SeenBy = '' THEN @UserIdsJson
                    ELSE JSON_QUERY(
                        CONCAT(
                            LEFT(SeenBy, LEN(SeenBy) - 1),
                            ',',
                            STUFF(@UserIdsJson, 1, 1, ''),
                            ']'
                        )
                    )
                END
            WHERE Id IN (SELECT Id FROM @Messages);
        `;

        await request.query(query);
        return true;
    } catch (err) {
        console.error('markMessagesSeen error:', err);
        return false;
    }
}

    static async fetchFriendMessageSummaries(currentUserId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'CurrentUserId', sql.UniqueIdentifier, currentUserId);

            const query = `
        WITH LastMessages AS (
            SELECT 
                m.ChatRoomId,
                m.Id AS MessageId,
                m.Message,
                m.SenderId,
                m.DateTimeSent,
                m.SeenBy,
                ROW_NUMBER() OVER (PARTITION BY m.ChatRoomId ORDER BY m.DateTimeSent DESC) AS rn
            FROM Messages m
        ),
        UnreadCounts AS (
            SELECT 
                m.ChatRoomId,
                COUNT(*) AS UnreadCount
            FROM Messages m
            WHERE m.SenderId != @CurrentUserId
              AND NOT EXISTS (
                  SELECT 1
                  FROM OPENJSON(ISNULL(m.SeenBy, '[]')) AS s
                  WHERE s.value = CAST(@CurrentUserId AS NVARCHAR(50))
              )
            GROUP BY m.ChatRoomId
        )
        SELECT 
            ucr.ChatRoomId,
            ucr2.UserId AS FriendId,
            lm.Message AS LastMessage,
            lm.SenderId AS LastMessageSenderId,
            lm.DateTimeSent AS LastMessageTime,
            ISNULL(uc.UnreadCount, 0) AS UnreadCount
        FROM UserChatRooms ucr
        INNER JOIN UserChatRooms ucr2 
            ON ucr.ChatRoomId = ucr2.ChatRoomId AND ucr2.UserId != ucr.UserId
        LEFT JOIN LastMessages lm
            ON ucr.ChatRoomId = lm.ChatRoomId AND lm.rn = 1
        LEFT JOIN UnreadCounts uc
            ON ucr.ChatRoomId = uc.ChatRoomId
        WHERE ucr.UserId = @CurrentUserId
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
