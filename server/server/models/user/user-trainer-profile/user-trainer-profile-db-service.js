import sql from "mssql/msnodesqlv8.js";
import Database from "../../database/database.js";
import ObjectMapper from "../../../utils/object-mapper.js";

export default class UserTrainerProfileDBService {
    static async fetchTrainerProfile(userId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, "UserId", sql.UniqueIdentifier, userId);

            const result = await request.query(`
                SELECT * FROM UserTrainerProfile WHERE UserId = @UserId
            `);

            const profile = result.recordset.map(row => {
                const trainerProfile = {};
                for (const key in row) {
                    trainerProfile[ObjectMapper.toCamelCase(key)] = key === 'Images' ? JSON.parse(row[key]) : row[key];
                }
                return trainerProfile;
            });

            return profile[0] || null;
        } catch (err) {
            console.error("fetchProfile error:", err);
            return null;
        }
    }

    static async updateTrainerProfile(userId, payload) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, "UserId", sql.UniqueIdentifier, userId);
            Database.addInput(request, "TrainerStatus", sql.VarChar(20), payload.trainerStatus);
            Database.addInput(request, "Biography", sql.VarChar(1000), payload.biography || '');
            Database.addInput(request, "YearsOfExperience", sql.VarChar(20), payload.yearsOfExperience);
            Database.addInput(request, "Images", sql.VarChar(sql.MAX), JSON.stringify(payload.images));

            const query = `
            UPDATE UserTrainerProfile
            SET
                TrainerStatus = @TrainerStatus,
                Biography = @Biography,
                YearsOfExperience = @YearsOfExperience,
                Images = @Images
            WHERE UserId = @UserId
        `;

            await request.query(query);
            return { success: true };
        } catch (err) {
            console.error("updateTrainerProfile error:", err);
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
