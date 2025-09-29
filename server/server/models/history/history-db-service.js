import sql from 'mssql/msnodesqlv8.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';

export default class HistoryDBService {
    static mergeChangedFields(prev, additions) {
        const oldFields = prev.ChangedFields.split(",").map(field => field.trim());
        const newFields = additions.split(",").map(field => field.trim());

        const mergedFieldsArray = [...oldFields];
        newFields.forEach(field => {
            if (!mergedFieldsArray.includes(field))
                mergedFieldsArray.push(field);
        });

        return mergedFieldsArray.join(",");
    }

    static async insertProfileHistory(transaction, userId, profile, changedFields) {
        delete profile.password;
        delete profile.imageBase64;
        if (profile.length === 0 && changedFields.length === 0) return { success: true };

        try {
            const checkReq = Database.getRequest(transaction);
            Database.addInput(checkReq, "UserId", sql.UniqueIdentifier, userId);

            const checkRes = await checkReq.query(`
            SELECT TOP 1 HistoryId, ChangedFields
            FROM UserProfileHistory
            WHERE UserId = @UserId AND DateOfUpdate >= DATEADD(HOUR, -1, SYSUTCDATETIME())
            ORDER BY DateOfUpdate DESC
        `);

            const prevRecord = checkRes.recordset[0];

            if (prevRecord) {
                const mergedFields = this.mergeChangedFields(prevRecord, changedFields);

                const req = Database.getRequest(transaction);
                Database.addInput(req, "HistoryId", sql.UniqueIdentifier, prevRecord.HistoryId);
                if (profile.firstname !== undefined && profile.firstname !== null)
                    Database.addInput(req, "Firstname", sql.VarChar(50), profile.firstname);
                if (profile.lastname !== undefined && profile.lastname !== null)
                    Database.addInput(req, "Lastname", sql.VarChar(50), profile.lastname);
                if (profile.age !== undefined && profile.age !== null)
                    Database.addInput(req, "Age", sql.Int, profile.age);
                if (profile.gender !== undefined && profile.gender !== null)
                    Database.addInput(req, "Gender", sql.VarChar(20), profile.gender);
                if (profile.email !== undefined && profile.email !== null)
                    Database.addInput(req, "Email", sql.VarChar(50), profile.email);
                if (profile.phone !== undefined && profile.phone !== null)
                    Database.addInput(req, "Phone", sql.VarChar(50), profile.phone);
                Database.addInput(req, "ChangedFields", sql.VarChar(500), mergedFields);

                const fieldsToUpdateCamel = changedFields.split(",").map(field => field.trim());
                const fieldsToUpdatePascal = fieldsToUpdateCamel.map(field => ObjectMapper.toPascalCase(field));
                const queryString = fieldsToUpdatePascal.map(field => `[${field}] = @${field}`).join(", ");

                await req.query(`
                UPDATE UserProfileHistory
                SET ${queryString},
                    ChangedFields = @ChangedFields,
                    DateOfUpdate = SYSUTCDATETIME()
                WHERE HistoryId = @HistoryId
            `);

            } else {
                // If no previous record exists or if the record is older than 1 hour
                const fields = ["UserId", "Firstname", "Lastname", "Age", "Gender", "Email", "Phone", "ChangedFields"];
                const values = fields.map(field => `@${field}`);

                const req = Database.getRequest(transaction);
                Database.addInput(req, "UserId", sql.UniqueIdentifier, userId);
                Database.addInput(req, "Firstname", sql.VarChar(50), profile.firstname);
                Database.addInput(req, "Lastname", sql.VarChar(50), profile.lastname);
                Database.addInput(req, "Age", sql.Int, profile.age);
                Database.addInput(req, "Gender", sql.VarChar(20), profile.gender);
                Database.addInput(req, "Email", sql.VarChar(50), profile.email);
                Database.addInput(req, "Phone", sql.VarChar(50), profile.phone);
                Database.addInput(req, "ChangedFields", sql.VarChar(500), changedFields);

                await req.query(`
                INSERT INTO UserProfileHistory (${fields.join(",")})
                VALUES (${values.join(",")})
            `);
            }

            return { success: true };
        } catch (err) {
            console.error(`[ProfileHistory] UserId: ${userId}`, err);
            throw err;
        }
    }

    static async insertMetricsHistory(transaction, userId, metrics, changedFields) {
        try {
            const checkReq = Database.getRequest(transaction);
            Database.addInput(checkReq, "UserId", sql.UniqueIdentifier, userId);

            const checkRes = await checkReq.query(`
            SELECT TOP 1 HistoryId, ChangedFields
            FROM UserMetricsHistory
            WHERE UserId = @UserId AND DateOfUpdate >= DATEADD(HOUR, -1, SYSUTCDATETIME())
            ORDER BY DateOfUpdate DESC
        `);

            const prevRecord = checkRes.recordset[0];

            if (prevRecord) {
                const mergedFields = this.mergeChangedFields(prevRecord, changedFields);

                const req = Database.getRequest(transaction);
                Database.addInput(req, "HistoryId", sql.UniqueIdentifier, prevRecord.HistoryId);
                Database.addInput(req, "ChangedFields", sql.VarChar(500), mergedFields);

                if (metrics.heightCm !== undefined && metrics.heightCm !== null)
                    Database.addInput(req, "HeightCm", sql.Decimal(5, 2), metrics.heightCm);
                if (metrics.weightKg !== undefined && metrics.weightKg !== null)
                    Database.addInput(req, "WeightKg", sql.Decimal(5, 2), metrics.weightKg);
                if (metrics.bmi !== undefined && metrics.bmi !== null)
                    Database.addInput(req, "BMI", sql.Decimal(4, 1), metrics.bmi);
                if (metrics.bmr !== undefined && metrics.bmr !== null)
                    Database.addInput(req, "BMR", sql.Int, metrics.bmr);
                if (metrics.tdee !== undefined && metrics.tdee !== null)
                    Database.addInput(req, "TDEE", sql.Int, metrics.tdee);
                if (metrics.bodyFat !== undefined && metrics.bodyFat !== null)
                    Database.addInput(req, "BodyFat", sql.Decimal(4, 1), metrics.bodyFat);
                if (metrics.leanBodyMass !== undefined && metrics.leanBodyMass !== null)
                    Database.addInput(req, "LeanBodyMass", sql.Decimal(5, 2), metrics.leanBodyMass);
                if (metrics.activityLevel !== undefined && metrics.activityLevel !== null)
                    Database.addInput(req, "ActivityLevel", sql.VarChar(20), metrics.activityLevel);

                const fieldsToUpdateCamel = changedFields.split(",").map(field => field.trim());
                const fieldsToUpdatePascal = fieldsToUpdateCamel.map(field => ObjectMapper.toPascalCase(field));
                const queryString = fieldsToUpdatePascal.map(field => `[${field}] = @${field}`).join(", ");

                await req.query(`
                UPDATE UserMetricsHistory
                SET ${queryString},
                    ChangedFields = @ChangedFields,
                    DateOfUpdate = SYSUTCDATETIME()
                WHERE HistoryId = @HistoryId
            `);

            } else {
                const fields = [
                    "UserId",
                    "HeightCm",
                    "WeightKg",
                    "BMI",
                    "BMR",
                    "TDEE",
                    "BodyFat",
                    "LeanBodyMass",
                    "ActivityLevel",
                    "ChangedFields"
                ];
                const values = fields.map(field => `@${field}`);

                const req = Database.getRequest(transaction);
                Database.addInput(req, "UserId", sql.UniqueIdentifier, userId);
                Database.addInput(req, "HeightCm", sql.Decimal(5, 2), metrics.heightCm);
                Database.addInput(req, "WeightKg", sql.Decimal(5, 2), metrics.weightKg);
                Database.addInput(req, "BMI", sql.Decimal(4, 1), metrics.bmi);
                Database.addInput(req, "BMR", sql.Int, metrics.bmr);
                Database.addInput(req, "TDEE", sql.Int, metrics.tdee);
                Database.addInput(req, "BodyFat", sql.Decimal(4, 1), metrics.bodyFat);
                Database.addInput(req, "LeanBodyMass", sql.Decimal(5, 2), metrics.leanBodyMass);
                Database.addInput(req, "ActivityLevel", sql.VarChar(20), metrics.activityLevel);
                Database.addInput(req, "ChangedFields", sql.VarChar(500), changedFields);

                await req.query(`
                INSERT INTO UserMetricsHistory (${fields.join(",")})
                VALUES (${values.join(",")})
            `);
            }

            return { success: true };
        } catch (err) {
            console.error(`[MetricsHistory] UserId: ${userId}`, err);
            throw err;
        }
    }

    static async insertNutritionHistory(transaction, userId, nutrition, changedFields) {
        try {
            const checkReq = Database.getRequest(transaction);
            Database.addInput(checkReq, "UserId", sql.UniqueIdentifier, userId);

            const checkRes = await checkReq.query(`
            SELECT TOP 1 HistoryId, ChangedFields
            FROM UserNutritionHistory
            WHERE UserId = @UserId AND DateOfUpdate >= DATEADD(HOUR, -1, SYSUTCDATETIME())
            ORDER BY DateOfUpdate DESC
        `);

            const prevRecord = checkRes.recordset[0];

            if (prevRecord) {
                const mergedFields = this.mergeChangedFields(prevRecord, changedFields);

                const req = Database.getRequest(transaction);
                Database.addInput(req, "HistoryId", sql.UniqueIdentifier, prevRecord.HistoryId);
                Database.addInput(req, "ChangedFields", sql.VarChar(300), mergedFields);

                if (nutrition.goal !== undefined && nutrition.goal !== null)
                    Database.addInput(req, "Goal", sql.VarChar(20), nutrition.goal);
                if (nutrition.recommendedEnergyKcal !== undefined && nutrition.recommendedEnergyKcal !== null)
                    Database.addInput(req, "RecommendedEnergyKcal", sql.Int, nutrition.recommendedEnergyKcal);
                if (nutrition.setEnergyKcal !== undefined && nutrition.setEnergyKcal !== null)
                    Database.addInput(req, "SetEnergyKcal", sql.Int, nutrition.setEnergyKcal);
                if (nutrition.waterMl !== undefined && nutrition.waterMl !== null)
                    Database.addInput(req, "WaterMl", sql.Decimal(6, 1), nutrition.waterMl);
                if (nutrition.diet !== undefined && nutrition.diet !== null)
                    Database.addInput(req, "Diet", sql.VarChar(50), nutrition.diet);
                if (nutrition.carbRate !== undefined && nutrition.carbRate !== null)
                    Database.addInput(req, "CarbRate", sql.Decimal(5, 2), nutrition.carbRate);
                if (nutrition.proteinRate !== undefined && nutrition.proteinRate !== null)
                    Database.addInput(req, "ProteinRate", sql.Decimal(5, 2), nutrition.proteinRate);
                if (nutrition.proteinRequirement !== undefined && nutrition.proteinRequirement !== null)
                    Database.addInput(req, "ProteinRequirement", sql.Decimal(6, 2), nutrition.proteinRequirement);
                if (nutrition.fatRate !== undefined && nutrition.fatRate !== null)
                    Database.addInput(req, "FatRate", sql.Decimal(5, 2), nutrition.fatRate);
                if (nutrition.carbGrams !== undefined && nutrition.carbGrams !== null)
                    Database.addInput(req, "CarbGrams", sql.Decimal(6, 2), nutrition.carbGrams);
                if (nutrition.proteinGrams !== undefined && nutrition.proteinGrams !== null)
                    Database.addInput(req, "ProteinGrams", sql.Decimal(6, 2), nutrition.proteinGrams);
                if (nutrition.fatGrams !== undefined && nutrition.fatGrams !== null)
                    Database.addInput(req, "FatGrams", sql.Decimal(6, 2), nutrition.fatGrams);

                const fieldsToUpdateCamel = changedFields.split(",").map(field => field.trim());
                const fieldsToUpdatePascal = fieldsToUpdateCamel.map(field => ObjectMapper.toPascalCase(field));
                const queryString = fieldsToUpdatePascal.map(field => `[${field}] = @${field}`).join(", ");

                await req.query(`
                UPDATE UserNutritionHistory
                SET ${queryString},
                    ChangedFields = @ChangedFields,
                    DateOfUpdate = SYSUTCDATETIME()
                WHERE HistoryId = @HistoryId
            `);

            } else {
                const fields = [
                    "UserId",
                    "Goal",
                    "RecommendedEnergyKcal",
                    "SetEnergyKcal",
                    "WaterMl",
                    "Diet",
                    "CarbRate",
                    "ProteinRate",
                    "ProteinRequirement",
                    "FatRate",
                    "CarbGrams",
                    "ProteinGrams",
                    "FatGrams",
                    "ChangedFields"
                ];
                const values = fields.map(field => `@${field}`);

                const req = Database.getRequest(transaction);
                Database.addInput(req, "UserId", sql.UniqueIdentifier, userId);
                Database.addInput(req, "Goal", sql.VarChar(20), nutrition.goal);
                Database.addInput(req, "RecommendedEnergyKcal", sql.Int, nutrition.recommendedEnergyKcal);
                Database.addInput(req, "SetEnergyKcal", sql.Int, nutrition.setEnergyKcal);
                Database.addInput(req, "WaterMl", sql.Decimal(6, 1), nutrition.waterMl);
                Database.addInput(req, "Diet", sql.VarChar(50), nutrition.diet);
                Database.addInput(req, "CarbRate", sql.Decimal(5, 2), nutrition.carbRate);
                Database.addInput(req, "ProteinRate", sql.Decimal(5, 2), nutrition.proteinRate);
                Database.addInput(req, "ProteinRequirement", sql.Decimal(6, 2), nutrition.proteinRequirement);
                Database.addInput(req, "FatRate", sql.Decimal(5, 2), nutrition.fatRate);
                Database.addInput(req, "CarbGrams", sql.Decimal(6, 2), nutrition.carbGrams);
                Database.addInput(req, "ProteinGrams", sql.Decimal(6, 2), nutrition.proteinGrams);
                Database.addInput(req, "FatGrams", sql.Decimal(6, 2), nutrition.fatGrams);
                Database.addInput(req, "ChangedFields", sql.VarChar(300), changedFields);

                await req.query(`
                INSERT INTO UserNutritionHistory (${fields.join(",")})
                VALUES (${values.join(",")})
            `);
            }

            return { success: true };
        } catch (err) {
            console.error(`[NutritionHistory] UserId: ${userId}`, err);
            throw err;
        }
    }

    static async getUserHistory(userId) {
        try {
            const pool = Database.getPool();

            const profileResult = await pool.request()
                .input("UserId", sql.UniqueIdentifier, userId)
                .query(`SELECT * FROM UserProfileHistory WHERE UserId = @UserId ORDER BY DateOfUpdate DESC`);

            const metricsResult = await pool.request()
                .input("UserId", sql.UniqueIdentifier, userId)
                .query(`SELECT * FROM UserMetricsHistory WHERE UserId = @UserId ORDER BY DateOfUpdate DESC`);

            const nutritionResult = await pool.request()
                .input("UserId", sql.UniqueIdentifier, userId)
                .query(`SELECT * FROM UserNutritionHistory WHERE UserId = @UserId ORDER BY DateOfUpdate DESC`);

            const profileHistory = {};
            profileResult.recordset.forEach(row => {
                profileHistory[row.HistoryId] = ObjectMapper.mapProfileHistory(row);
            });

            const metricsHistory = {};
            metricsResult.recordset.forEach(row => {
                metricsHistory[row.HistoryId] = ObjectMapper.mapMetricsHistory(row);
            });

            const nutritionHistory = {};
            nutritionResult.recordset.forEach(row => {
                nutritionHistory[row.HistoryId] = ObjectMapper.mapNutritionHistory(row);
            });

            return { success: true, history: { profileHistory, metricsHistory, nutritionHistory } };
        } catch (err) {
            console.error(`[GetUserHistory] UserId: ${userId}`, err);
            return { success: false, message: "Failed to fetch user history." };
        }
    }
}
