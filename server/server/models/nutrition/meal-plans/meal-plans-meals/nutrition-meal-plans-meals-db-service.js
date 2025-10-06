import sql from 'mssql/msnodesqlv8.js';
import Database from '../../../database/database.js';
import ObjectMapper from '../../../../utils/object-mapper.js';

export default class NutritionMealPlansMealsDBService {
    static normalizeDate(date) {
        return new Date(date).toISOString().split('T')[0];
    }

       static async createMeal(planId, label, time) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'MealPlanId', sql.Int, planId);
            Database.addInput(request, 'Label', sql.VarChar(50), label);
            Database.addInput(request, 'Time', sql.Time, time || null);

            const query = `
                INSERT INTO dbo.MealPlansMeals (MealPlanId, Label, Time)
                OUTPUT INSERTED.*
                VALUES (@MealPlanId, @Label, @Time);
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const meal = {};
            for (const key in result.recordset[0])
                meal[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];

            return meal;
        } catch (e) {
            console.error('createMeal error:', e);
            return null;
        }
    }

    static async deleteMeal(mealId) {
        if (!mealId) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, mealId);

            const query = `
                DELETE FROM dbo.MealPlansMeals
                WHERE Id = @Id;
            `;

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('deleteMeal error:', err);
            return false;
        }
    }

    static async updateMeal(mealId, newLabel, newTime) {
        if (!mealId || !newLabel || !newTime) return null;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, mealId);
            Database.addInput(request, 'Label', sql.VarChar(50), newLabel);
            Database.addInput(request, 'Time', sql.Time, newTime || null);

            const query = `
                UPDATE dbo.MealPlansMeals
                SET Label = @Label, Time = @Time
                OUTPUT INSERTED.*
                WHERE Id = @Id;
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const meal = {};
            for (const key in result.recordset[0])
                meal[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];

            return meal;
        } catch (err) {
            console.error('updateMeal error:', err);
            return null;
        }
    }

    static async fetchMealsByPlanId(planId) {
        if (!planId) return [];

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'MealPlanId', sql.Int, planId);

            const query = `
                SELECT * FROM dbo.MealPlansMeals
                WHERE MealPlanId = @MealPlanId;
            `;

            const result = await request.query(query);
            const meals = result.recordset.map(row => {
                const obj = {};
                for (const key in row)
                    obj[ObjectMapper.toCamelCase(key)] = row[key];

                return obj;
            });

            console.log(meals)
            return meals;
        } catch (err) {
            console.error('fetchMealsByPlanId error:', err);
            return [];
        }
    }
}