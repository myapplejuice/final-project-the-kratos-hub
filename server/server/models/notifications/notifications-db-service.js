import sql from 'mssql/msnodesqlv8.js';
import UserEncryption from "../../utils/password-hasher.js";
import HistoryDBService from '../history/history-db-service.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';

export default class NotificationsDBService {
    static async fetchNotifications(userId) {
        try {
            const request = Database.getRequest(Database.getPool().transaction);
            Database.addInput(request, "UserId", sql.Int, userId);
            const query = `
                SELECT * FROM UserNotifications
                WHERE UserId = @UserId
                ORDER BY DateOfCreation DESC
            `
            const queryResult = await request.query(query);
            if (queryResult.recordset.length === 0) return [];

            return queryResult.recordset.map(row => {
                const notification = {};
                for (const key in row) {
                    const value = row[key];
                    
                    if(key === 'ExtraInformation')
                        value = JSON.parse(value);
                    
                    notification[ObjectMapper.toCamelCase(key)] = row[key];
                }
                return notification;
            });
        } catch (err) {
            console.error('getNotifications error:', err);
            return [];
        }
    }

    static async pushNotification(details){
        try {
            const request = Database.getRequest(Database.getPool().transaction);
            Database.addInput(request, "UserId", sql.Int, details.userId);
            Database.addInput(request, "Notification", sql.VarChar(500), details.notification);
            Database.addInput(request, "ExtraInformation", sql.VarChar(500), JSON.stringify(details.extraInformation));
            Database.addInput(request, "Seen", sql.Bit, details.seen);
            Database.addInput(request, "DateOfCreation", sql.DateTime2, details.dateOfCreation || new Date());

            const query = `
                INSERT INTO UserNotifications (UserId, Notification, ExtraInformation, Seen, DateOfCreation)
                VALUES (@UserId, @Notification, @ExtraInformation, @Seen, @DateOfCreation)
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return false;

            return true;
        } catch (err) {
            console.error('pushNotification error:', err);
        }
    }

    static async setNotificationSeen(id){
        try {
            const request = Database.getRequest(Database.getPool().transaction);
            Database.addInput(request, "Id", sql.Int, id);

            const query = `
                UPDATE UserNotifications
                SET Seen = 1
                WHERE Id = @Id
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return false;

            return true;
        } catch (err) {
            console.error('setNotificationSeen error:', err);
        }
    }
}