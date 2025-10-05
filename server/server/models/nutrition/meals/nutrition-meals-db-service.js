import sql from 'mssql/msnodesqlv8.js';
import Database from '../../database/database.js';
import ObjectMapper from '../../../utils/object-mapper.js';
import NutritionMealsFoodsDBService from './meal-foods/nutrition-meals-foods-db-service.js';

export default class NutritionMealsDBService {
    static normalizeDate(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    static async createMeal(nutritionLogId, label, time) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, "NutritionLogId", sql.Int, nutritionLogId);
            Database.addInput(request, "Label", sql.VarChar(100), label);
            Database.addInput(request, "Time", sql.DateTime2, new Date(time));

            const query = `
                INSERT INTO dbo.MealLogs (NutritionLogId, Label, Time)
                OUTPUT INSERTED.*
                VALUES (@NutritionLogId, @Label, @Time);
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const meal = {};
            for (const key in result.recordset[0]) {
                meal[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            return meal;
        } catch (e) {
            console.error("createMeal error:", e);
            return { success: false, meal: null };
        }
    }

    static async deleteMeal(mealId) {
        if (!mealId) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, mealId);

            const query = `
                DELETE FROM MealLogs
                WHERE Id = @Id
            `;

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('deleteMeal error:', err);
            return false;
        }
    }

    static async updateMealLabel(mealId, newLabel) {
        if (!mealId || !newLabel) return null;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, mealId);
            Database.addInput(request, 'Label', sql.VarChar(100), newLabel);

            const query = `
                UPDATE MealLogs
                SET Label = @Label
                OUTPUT INSERTED.*
                WHERE Id = @Id
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const meal = {};
            for (const key in result.recordset[0]) {
                meal[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            meal.foods = await NutritionMealsFoodsDBService.fetchFoodsByMealId(meal.id);
            return meal;
        } catch (err) {
            console.error('updateMealLabel error:', err);
            return null;
        }
    }

    static async fetchMealsByNutritionLogId(nutritionLogId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'NutritionLogId', sql.Int, nutritionLogId);

            const query = `SELECT * FROM MealLogs WHERE NutritionLogId = @NutritionLogId`;
            const result = await request.query(query);

            const meals = await Promise.all(result.recordset.map(async meal => {
                const obj = {};
                for (const key in meal) obj[ObjectMapper.toCamelCase(key)] = meal[key];

                // Fetch foods for this meal
                obj.foods = await NutritionMealsFoodsDBService.fetchFoodsByMealId(obj.id);
                return obj;
            }));

            return meals;
        } catch (err) {
            console.error('fetchMealsByNutritionLogId error:', err);
            return [];
        }
    }

}
