import sql from 'mssql/msnodesqlv8.js';
import Database from '../../database/database.js';
import ObjectMapper from '../../../utils/object-mapper.js';
import NutritionMealsDBService from '../meals/nutrition-meals-db-service.js';
import UserDBService from '../../user/user-db-service.js';

export default class NutritionDaysDBService {
    static normalizeDate(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    static async fetchAllDays(userId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            const query = `
                SELECT *
                FROM NutritionLogs
                WHERE UserId = @UserId
                ORDER BY Date DESC
            `;

            const result = await request.query(query);

            const days = {};

            for (const day of result.recordset) {
                const dayId = day.Id; // GUID of this day
                const camelCaseDay = {};

                for (const key in day) {
                    let value = day[key];
                    if (key.toLowerCase() === 'date') {
                        value = this.normalizeDate(value);
                    }
                    camelCaseDay[ObjectMapper.toCamelCase(key)] = value;
                }

                // Fetch meals for this day
                const meals = await NutritionMealsDBService.fetchMealsByNutritionLogId(dayId);
                camelCaseDay.meals = meals.map(meal => ({ ...meal }));

                // Key by date
                const dateKey = this.normalizeDate(day.Date);
                days[dateKey] = camelCaseDay;
            }

            return days;
        } catch (err) {
            console.error('fetchAllDays error:', err);
            return {};
        }
    }

    static async fetchDayByDate(userId, date) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'Date', sql.DateTime2, new Date(date));

            const query = `
                SELECT *
                FROM NutritionLogs
                WHERE UserId = @UserId AND CAST(Date AS DATE) = CAST(@Date AS DATE)
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const day = result.recordset[0];
            const camelCaseDay = {};
            for (const key in day) {
                let value = day[key];
                if (key.toLowerCase() === 'date') {
                    value = this.normalizeDate(value);
                }
                camelCaseDay[ObjectMapper.toCamelCase(key)] = value;
            }

            // Fetch meals for this day
            const meals = await NutritionMealsDBService.fetchMealsByNutritionLogId(day.Id);
            camelCaseDay.meals = meals.map(meal => ({ ...meal }));

            return camelCaseDay;
        } catch (err) {
            console.error('fetchDayByDate error:', err);
            return null;
        }
    }

    static async updateDay(userId, date, payload) {
        try {
            if (!payload || Object.keys(payload).length === 0) {
                return { success: false, message: 'No target fields provided.' };
            }

            const updateRequest = Database.getRequest();
            Database.addInput(updateRequest, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(updateRequest, 'Date', sql.DateTime2, new Date(date));

            const setClauses = [];
            for (const key in payload) {
                const pascalKey = ObjectMapper.toPascalCase(key);
                const type = ObjectMapper.getSQLType(pascalKey);
                const value = payload[key];
                Database.addInput(updateRequest, pascalKey, type, value);
                setClauses.push(`${pascalKey} = @${pascalKey}`);
            }

            const updateQuery = `
            UPDATE NutritionLogs
            SET ${setClauses.join(', ')}
            OUTPUT inserted.*
            WHERE UserId = @UserId AND Date >= @Date
        `;

            const result = await updateRequest.query(updateQuery);

            const updatedDays = {};
            for (const row of result.recordset) {
                const camelCaseRow = {};
                for (const key in row) {
                    let value = row[key];
                    if (key.toLowerCase() === 'date') value = this.normalizeDate(value);
                    camelCaseRow[ObjectMapper.toCamelCase(key)] = value;
                }

                // Fetch meals for the updated day
                const meals = await NutritionMealsDBService.fetchMealsByNutritionLogId(row.Id);
                camelCaseRow.meals = meals.map(meal => ({ ...meal }));

                const dayKey = this.normalizeDate(row.Date);
                updatedDays[dayKey] = camelCaseRow;
            }

            return { success: true, updatedDays };
        } catch (err) {
            console.error('updateDay error:', err);
            return { success: false, message: 'Database error while updating day targets' };
        }
    }

    static async updateConsumption(userId, date, payload) {
        try {
            if (!payload || Object.keys(payload).length === 0) {
                return { success: false, message: 'No target fields provided.' };
            }

            const updateRequest = Database.getRequest();
            Database.addInput(updateRequest, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(updateRequest, 'Date', sql.DateTime2, new Date(date));

            const setClauses = [];
            for (const key in payload) {
                const pascalKey = ObjectMapper.toPascalCase(key);
                const type = ObjectMapper.getSQLType(pascalKey);
                const value = payload[key];
                Database.addInput(updateRequest, pascalKey, type, value);
                setClauses.push(`${pascalKey} = @${pascalKey}`);
            }

            const updateQuery = `
            UPDATE NutritionLogs
            SET ${setClauses.join(', ')}
            OUTPUT inserted.*
            WHERE UserId = @UserId AND CAST(Date AS DATE) = CAST(@Date AS DATE)
        `;

            const result = await updateRequest.query(updateQuery);
            if (!result.recordset || result.recordset.length === 0) {
                return { success: false, message: 'No rows updated.' };
            }

            const updatedDay = {};
            for (const key in result.recordset[0]) {
                let value = result.recordset[0][key];
                if (key.toLowerCase() === 'date') value = this.normalizeDate(value);
                updatedDay[ObjectMapper.toCamelCase(key)] = value;
            }

            // Fetch meals
            const meals = await NutritionMealsDBService.fetchMealsByNutritionLogId(result.recordset[0].Id);
            updatedDay.meals = meals.map(meal => ({ ...meal }));

            return { success: true, updated: updatedDay };
        } catch (err) {
            console.error('updateConsumption error:', err);
            return { success: false, message: 'Database error while updating day targets' };
        }
    }

    static async ensureDayAndFutureDays(userId, date) {
        try {
            const normalizedDate = new Date(date);
            const insertedDays = {};

            const userProfile = await UserDBService.fetchUserProfile(userId);
            if (!userProfile) {
                return { success: false, message: 'User not found' };
            }

            const nutrition = userProfile.nutrition;

            for (let i = 0; i <= 3; i++) {
                const currentDate = new Date(normalizedDate);
                currentDate.setDate(normalizedDate.getDate() + i);

                const request = Database.getRequest();
                Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
                Database.addInput(request, 'Date', sql.DateTime2, currentDate);

                const checkQuery = `
                SELECT *
                FROM NutritionLogs
                WHERE UserId = @UserId AND CAST(Date AS DATE) = CAST(@Date AS DATE)`;
                const existing = await request.query(checkQuery);

                let dayData;
                let dayId;

                if (existing.recordset.length === 0) {
                    const insertRequest = Database.getRequest();
                    Database.addInput(insertRequest, 'UserId', sql.UniqueIdentifier, userId);
                    Database.addInput(insertRequest, 'Date', sql.DateTime2, currentDate);
                    Database.addInput(insertRequest, 'Goal', sql.VarChar(50), nutrition.goal);
                    Database.addInput(insertRequest, 'Diet', sql.VarChar(50), nutrition.diet);
                    Database.addInput(insertRequest, 'CarbRate', sql.Decimal(5, 2), nutrition.carbRate);
                    Database.addInput(insertRequest, 'ProteinRate', sql.Decimal(5, 2), nutrition.proteinRate);
                    Database.addInput(insertRequest, 'FatRate', sql.Decimal(5, 2), nutrition.fatRate);
                    Database.addInput(insertRequest, 'ProteinRequirement', sql.Decimal(5, 2), nutrition.proteinRequirement);
                    Database.addInput(insertRequest, 'TargetEnergyKcal', sql.Int, nutrition.setEnergyKcal);
                    Database.addInput(insertRequest, 'TargetCarbGrams', sql.Int, nutrition.carbGrams);
                    Database.addInput(insertRequest, 'TargetProteinGrams', sql.Int, nutrition.proteinGrams);
                    Database.addInput(insertRequest, 'TargetFatGrams', sql.Int, nutrition.fatGrams);
                    Database.addInput(insertRequest, 'TargetWaterMl', sql.Int, nutrition.waterMl);

                    const insertResult = await insertRequest.query(`
                    INSERT INTO NutritionLogs
                    (UserId, Date, Goal, Diet, CarbRate, ProteinRate, FatRate, ProteinRequirement,
                     TargetEnergyKcal, TargetCarbGrams, TargetProteinGrams, TargetFatGrams, TargetWaterMl)
                    OUTPUT INSERTED.*
                    VALUES
                    (@UserId, @Date, @Goal, @Diet, @CarbRate, @ProteinRate, @FatRate, @ProteinRequirement,
                     @TargetEnergyKcal, @TargetCarbGrams, @TargetProteinGrams, @TargetFatGrams, @TargetWaterMl)`);

                    if (!insertResult.recordset.length) continue;

                    dayId = insertResult.recordset[0].Id;

                    dayData = {};
                    for (const key in insertResult.recordset[0]) {
                        let value = insertResult.recordset[0][key];
                        if (key.toLowerCase() === 'date') value = this.normalizeDate(value);
                        dayData[ObjectMapper.toCamelCase(key)] = value;
                    }

                } else {
                    dayId = existing.recordset[0].Id;
                    dayData = {};
                    for (const key in existing.recordset[0]) {
                        let value = existing.recordset[0][key];
                        if (key.toLowerCase() === 'date') value = this.normalizeDate(value);
                        dayData[ObjectMapper.toCamelCase(key)] = value;
                    }
                }

                const meals = await NutritionMealsDBService.fetchMealsByNutritionLogId(dayId);
                dayData.meals = meals.map(meal => ({ ...meal }));

                const dayKey = this.normalizeDate(currentDate);
                insertedDays[dayKey] = dayData;
            }

            return { success: true, newDays: insertedDays };
        } catch (err) {
            console.error('ensureDayAndFutureDays error:', err);
            return { success: false, message: 'Database error while ensuring days' };
        }
    }
}