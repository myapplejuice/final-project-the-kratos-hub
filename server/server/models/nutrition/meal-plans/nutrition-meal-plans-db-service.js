import sql from 'mssql/msnodesqlv8.js';
import Database from '../../database/database.js';
import ObjectMapper from '../../../utils/object-mapper.js';
import NutritionMealPlansMealsDBService from './meal-plans-meals/nutrition-meal-plans-meals-db-service.js';
import NutritionMealPlansMealsFoodsDBService from './meal-plans-meals/meal-plans-meals-foods/nutrition-meal-plans-meals-foods-db-service.js';

export default class NutritionMealPlansDBService {
    static normalizeDate(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    static async createPlan(userId, details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'DateOfCreation', sql.DateTime2, new Date(details.dateOfCreation));
            Database.addInput(request, 'IsCreatedByCoach', sql.Bit, details.isCreatedByCoach);
            Database.addInput(request, 'CoachId', sql.UniqueIdentifier, details.coachId || null);
            Database.addInput(request, 'Label', sql.VarChar(50), details.label);
            Database.addInput(request, 'Description', sql.VarChar(400), details.description);
            Database.addInput(request, 'SourcePlanId', sql.Int, details.sourcePlanId || null);

            const query = `
                INSERT INTO dbo.MealPlans (UserId, DateOfCreation, IsCreatedByCoach, CoachId, Label, Description, SourcePlanId)
                OUTPUT INSERTED.*
                VALUES (@UserId, @DateOfCreation, @IsCreatedByCoach, @CoachId, @Label, @Description, @SourcePlanId)
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const plan = {};
            for (const key in result.recordset[0]) {
                plan[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            return plan;
        } catch (err) {
            console.error('createPlan error:', err);
            return null;
        }
    }

    static async deletePlan(planId) {
        if (!planId) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, planId);

            const query = `
                DELETE FROM dbo.MealPlans
                WHERE Id = @Id
            `;

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('deletePlan error:', err);
            return false;
        }
    }

    static async updatePlan(planId, newLabel, newDescription) {
        if (!planId || !newLabel || !newDescription) return null;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, planId);
            Database.addInput(request, 'Label', sql.VarChar(50), newLabel);
            Database.addInput(request, 'Description', sql.VarChar(400), newDescription);

            const query = `
                UPDATE dbo.MealPlans
                SET Label = @Label, Description = @Description
                OUTPUT INSERTED.*
                WHERE Id = @Id
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const plan = {};
            for (const key in result.recordset[0]) {
                plan[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            return plan;
        } catch (err) {
            console.error('updatePlan error:', err);
            return null;
        }
    }

    static async fetchPlansByUserId(userId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            const query = `SELECT * FROM dbo.MealPlans WHERE UserId = @UserId ORDER BY Id ASC`;
            const result = await request.query(query);

            if (result.recordset.length === 0) return [];

            const plans = await Promise.all(
                result.recordset.map(async plan => {
                    const obj = {};
                    for (const key in plan) {
                        obj[ObjectMapper.toCamelCase(key)] = plan[key];
                    }

                    const meals = await NutritionMealPlansMealsDBService.fetchMealsByPlanId(obj.id);
                    obj.meals = meals;
                    return obj;
                })
            );


            return plans;
        } catch (err) {
            console.error('fetchPlansByUserId error:', err);
            return [];
        }
    }

    static async clonePlan(sourcePlan, newUserId, sourcePlanUsername) {
        try {
            const newPlan = await NutritionMealPlansDBService.createPlan(newUserId, {
                sourcePlanId: sourcePlan.id,
                dateOfCreation: new Date(),
                isCreatedByCoach: sourcePlan.isCreatedByCoach || false,
                coachId: sourcePlan.coachId || null,
                label: `${sourcePlan.label}`,
                description: sourcePlan.description !== 'No description provided' ? 
                sourcePlan.description + "\n\nImported from " + sourcePlanUsername :
                    "Cloned plan - Imported from " + sourcePlanUsername,
            });

            if (!newPlan || !newPlan.id) throw new Error("Failed to create new plan");

            newPlan.meals = [];

            for (const meal of sourcePlan.meals || []) {
                const newMeal = await NutritionMealPlansMealsDBService.createMeal(
                    newPlan.id,
                    meal.label,
                    meal.time
                );

                if (!newMeal || !newMeal.id) continue;

                newMeal.foods = [];

                for (const food of meal.foods || []) {
                    const newFood = { ...food };
                    delete newFood.id;
                    newFood.mealId = newMeal.id;
                    newFood.ownerId = newUserId;
                    newFood.creatorId = food.creatorId || newUserId;

                    const foodId = await NutritionMealPlansMealsFoodsDBService.addFood(newFood);
                    if (foodId) {
                        newFood.id = foodId;
                        newMeal.foods.push(newFood);
                    }
                }

                newPlan.meals.push(newMeal);
            }

            return newPlan;
        } catch (err) {
            console.error("clonePlan error:", err);
            return null;
        }
    }
}