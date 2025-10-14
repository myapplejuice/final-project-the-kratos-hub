import sql from "mssql/msnodesqlv8.js";
import Database from "../../database/database.js";

export default class UserTrainerProfileDBService {
    static async fetchTrainerProfile(userId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, "UserId", sql.UniqueIdentifier, userId);

            const result = await request.query(`
                SELECT * FROM UserTrainerProfile WHERE UserId = @UserId
            `);

            return result.recordset[0] || [];
        } catch (err) {
            console.error("fetchProfile error:", err);
            return null;
        }
    }

    static async updateTrainerProfile(userId, payload) {
        try {
            const updates = [];
            const request = Database.getRequest();

            for (const [key, value] of Object.entries(payload)) {
                const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                updates.push(`${pascalKey} = @${pascalKey}`);
                Database.addInput(request, pascalKey, sql.VarChar(sql.MAX), value);
            }

            if (updates.length === 0) {
                return { success: false, message: "No fields to update." };
            }

            Database.addInput(request, "UserId", sql.UniqueIdentifier, userId);

            const query = `
                UPDATE UserTrainerProfile
                SET ${updates.join(", ")}
                WHERE UserId = @UserId
            `;

            await request.query(query);

            return { success: true };
        } catch (err) {
            console.error("updateProfile error:", err);
            return { success: false, message: "Error updating trainer profile." };
        }
    }

    static async verifyTrainer(userId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, "UserId", sql.UniqueIdentifier, userId);

            const query = `
                UPDATE UserTrainerProfile
                SET IsVerified = 1, TrainerStatus = 'active'
                WHERE UserId = @UserId
            `;

            await request.query(query);
            return { success: true };
        } catch (err) {
            console.error("verifyTrainer error:", err);
            return { success: false, message: "Error verifying trainer." };
        }
    }
}
