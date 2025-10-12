import sql from 'mssql/msnodesqlv8.js';
import UserEncryption from "../../utils/password-hasher.js";
import HistoryDBService from '../history/history-db-service.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';
import ChatDBService from '../socket/chat-db-service.js';

export default class UserToUserDBService {
    static async fetchUserProfile(id, withAdditionalInfo = true) {
        try {
            const request = Database.getRequest();
            const key = 'Id';
            const sqlType = ObjectMapper.getSQLType(key);
            Database.addInput(request, key, sqlType, id);

            const query = `
                SELECT u.*, m.*, n.*
                FROM Users u
                LEFT JOIN UserMetrics m ON u.Id = m.UserId
                LEFT JOIN UserNutrition n ON u.Id = n.UserId
                WHERE u.Id = @Id
            `;

            const result = await request.query(query);
            if (!result.recordset.length) return null;

            const row = result.recordset[0];
            if (withAdditionalInfo) {
                return {
                    ...ObjectMapper.mapUser(row),
                    metrics: ObjectMapper.mapMetrics(row),
                    nutrition: ObjectMapper.mapNutrition(row)
                }
            }
            else {
                return ObjectMapper.mapUser(row);
            }
        } catch (err) {
            console.error('fetchUserProfile error:', err);
            return null;
        }
    }

    static async fetchMultipleUserProfiles(idList, withAdditionalInfo = true) {
        try {
            if (!idList || !idList.length) return [];

            const request = Database.getRequest();

            // Build dynamic WHERE clause with parameterized inputs
            const idParams = idList.map((_, i) => `@Id${i}`).join(', ');
            idList.forEach((id, i) => {
                Database.addInput(request, `Id${i}`, sql.UniqueIdentifier, id);
            });

            const query = `
            SELECT u.*, m.*, n.*
            FROM Users u
            LEFT JOIN UserMetrics m ON u.Id = m.UserId
            LEFT JOIN UserNutrition n ON u.Id = n.UserId
            WHERE u.Id IN (${idParams})
        `;

            const result = await request.query(query);
            if (!result.recordset.length) return [];

            return result.recordset.map(row => {
                if (withAdditionalInfo) {
                    return {
                        ...ObjectMapper.mapUser(row),
                        metrics: ObjectMapper.mapMetrics(row),
                        nutrition: ObjectMapper.mapNutrition(row)
                    };
                } else {
                    return ObjectMapper.mapUser(row);
                }
            });
        } catch (err) {
            console.error('fetchUsersByIdList error:', err);
            return [];
        }
    }

    static async sendFriendRequest(details) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, 'AdderId', sql.UniqueIdentifier, details.adderId);
            Database.addInput(request, 'ReceiverId', sql.UniqueIdentifier, details.receiverId);
            Database.addInput(request, 'Status', sql.VarChar(20), details.status || 'pending');
            Database.addInput(request, 'Description', sql.VarChar(500), details.description || '');
            Database.addInput(request, 'DateOfCreation', sql.DateTime2, details.dateOfCreation || new Date());

            const checkQuery = `
                    SELECT Id, Status 
                    FROM FriendRequests
                    WHERE 
                        (AdderId = @AdderId AND ReceiverId = @ReceiverId)
                        OR
                        (AdderId = @ReceiverId AND ReceiverId = @AdderId)
                        AND Status = 'pending'
                `;
            const existing = await request.query(checkQuery);

            if (existing.recordset.length > 0) {
                return { success: false, message: "Friend request already sent" };
            }

            const insertQuery = `
                INSERT INTO FriendRequests (AdderId, ReceiverId, Status, Description, DateOfCreation)
                VALUES (@AdderId, @ReceiverId, @Status, @Description, @DateOfCreation)
            `;
            await request.query(insertQuery);

            return { success: true, message: "Friend request sent successfully" };

        } catch (err) {
            console.error('sendFriendRequest error:', err);
            return { success: false, message: "Failed to send friend request" };
        }
    }

    static async fetchUserFriendsList(userId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            const query = `
            SELECT 
                Id,
                CASE 
                    WHEN UserOne = @UserId THEN UserTwo
                    ELSE UserOne
                END AS FriendId,
                Status,
                TerminatedBy
            FROM UserFriendList
            WHERE UserOne = @UserId OR UserTwo = @UserId
        `;

            const result = await request.query(query);

            if (!result.recordset.length) return [];

            return result.recordset.map(r => ({
                id: r.Id,
                friendId: r.FriendId,
                terminatedBy: r.TerminatedBy,
                status: r.Status
            }));
        } catch (err) {
            console.error('fetchUserFriendsList error:', err);
            return [];
        }
    }

    static async fetchUserPendingFriendsList(userId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            const query = `
            SELECT Id, AdderId, ReceiverId, Status, Description, DateOfCreation,
                CASE 
                    WHEN AdderId = @UserId THEN 'adder'
                    ELSE 'receiver'
                END AS Role
            FROM FriendRequests
            WHERE (AdderId = @UserId OR ReceiverId = @UserId)`;

            const result = await request.query(query);
            if (!result.recordset.length) return [];

            return result.recordset.map(r => ({
                id: r.Id,
                adderId: r.AdderId,
                receiverId: r.ReceiverId,
                status: r.Status,
                description: r.Description,
                dateOfCreation: r.DateOfCreation,
                role: r.Role
            }));
        } catch (err) {
            console.error('fetchUserPendingFriendsList error:', err);
            return [];
        }
    }

    static async replyToFriendRequest(details) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, 'Id', sql.Int, details.id);
            Database.addInput(request, 'Status', sql.VarChar(20), details.reply);

            const updateQuery = `
            UPDATE FriendRequests
            SET Status = @Status
            WHERE Id = @Id
        `;
            await request.query(updateQuery);

            let newRowId = null;
            let newChatId = null;

            if (details.reply === 'accepted') {
                let userOne = details.adderId;
                let userTwo = details.receiverId;

                // Swap so UserOne < UserTwo
                if (userOne > userTwo) {
                    [userOne, userTwo] = [userTwo, userOne];
                }

                Database.addInput(request, 'UserOne', sql.UniqueIdentifier, userOne);
                Database.addInput(request, 'UserTwo', sql.UniqueIdentifier, userTwo);

                const insertQuery = `
                INSERT INTO UserFriendList (UserOne, UserTwo, Status)
                OUTPUT INSERTED.Id
                VALUES (@UserOne, @UserTwo, 'active')
            `;

                const result = await request.query(insertQuery);
                newRowId = result.recordset[0]?.Id || null;

                newChatId = await ChatDBService.createNewChat(userOne, userTwo);
            }

            return {
                success: true,
                message: "Friend request updated successfully",
                id: newRowId,
                newChatId,
            };

        } catch (err) {
            console.error('replyToFriendRequest error:', err);
            return { success: false, message: "Failed to update friend request" };
        }
    }

    static async disableFriendship(id, terminatorId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, id);
            Database.addInput(request, 'TerminatedBy', sql.UniqueIdentifier, terminatorId);

            const updateQuery = `
            UPDATE UserFriendList
            SET Status = 'inactive', TerminatedBy = @TerminatedBy
            WHERE Id = @Id
        `;
            const result = await request.query(updateQuery);
            if (!result.rowsAffected[0]) return { success: false, message: "Failed to disable friendship" };

            return { success: true, message: "Friendship disabled successfully" };

        } catch (err) {
            console.error('disableFriendship error:', err);
            return { success: false, message: "Failed to disable friendship" };
        }
    }

    static async restoreFriendship(id) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, id);
            Database.addInput(request, 'TerminatedBy', sql.UniqueIdentifier, null);

            const updateQuery = `
            UPDATE UserFriendList
            SET Status = 'active', TerminatedBy = @TerminatedBy
            WHERE Id = @Id
        `;
            const result = await request.query(updateQuery);
            if (!result.rowsAffected[0]) return { success: false, message: "Failed to disable friendship" };

            return { success: true, message: "Friendship disabled successfully" };

        } catch (err) {
            console.error('disableFriendship error:', err);
            return { success: false, message: "Failed to disable friendship" };
        }
    }
}