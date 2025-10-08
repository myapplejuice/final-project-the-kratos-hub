import sql from 'mssql/msnodesqlv8.js';
import UserEncryption from "../../utils/password-hasher.js";
import HistoryDBService from '../history/history-db-service.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';

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
                WHERE AdderId = @AdderId AND ReceiverId = @ReceiverId
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

}