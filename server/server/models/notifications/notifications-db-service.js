import sql from 'mssql/msnodesqlv8.js';
import UserEncryption from "../../utils/password-hasher.js";
import HistoryDBService from '../history/history-db-service.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';

export default class NotificationsDBService {
    static async fetchNotifications(userId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, "UserId", sql.UniqueIdentifier, userId);

            const query = `
            SELECT * FROM UserNotifications
            WHERE UserId = @UserId
            ORDER BY DateOfCreation DESC, Id DESC
        `;

            const queryResult = await request.query(query);
            if (queryResult.recordset.length === 0) return [];

            return queryResult.recordset.map(row => {
                const notification = {};
                for (const key in row) {
                    let value = row[key];
                    notification[ObjectMapper.toCamelCase(key)] = value;
                }
                return notification;
            });
        } catch (err) {
            console.error('fetchNotifications error:', err);
            return [];
        }
    }


    static async pushNotification(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, "UserId", sql.UniqueIdentifier, details.userId);
            Database.addInput(request, "Notification", sql.VarChar(500), details.notification);
            Database.addInput(request, "Seen", sql.Bit, details.seen);
            Database.addInput(request, "DateOfCreation", sql.DateTime2, details.dateOfCreation || new Date());

            const query = `
                INSERT INTO UserNotifications (UserId, Notification, Seen, DateOfCreation)
                VALUES (@UserId, @Notification, @Seen, @DateOfCreation)
            `;

            const result = await request.query(query);
            if (result.rowsAffected[0] === 0) return false;

            return true;
        } catch (err) {
            console.error('pushNotification error:', err);
        }
    }

    static async setNotificationsSeen(idList) {
        if (!idList || !idList.length || idList.length === 0) return { success: true };

        try {
            const request = Database.getRequest();

              idList.forEach((id, i) => {
            Database.addInput(request, `Id${i}`, sql.Int, parseInt(id, 10));
        });

        const idParams = idList.map((_, i) => `@Id${i}`).join(', ');

            const query = `
            UPDATE UserNotifications
            SET Seen = 1
            WHERE Id IN (${idParams})
        `;

            await request.query(query);

            return { success: true };
        } catch (err) {
            console.error('setNotificationSeen error:', err);
            return { success: false, message: err.message };
        }
    }

}