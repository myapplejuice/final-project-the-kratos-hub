import NutritionMealPlansMealsDBService from "./nutrition-meal-plans-meals-db-service.js";

export default class NutritionMealPlansMealsController {
    static async createMeal(req, res) {
        const { planId, label, time } = req.body;
        
        const meal = await NutritionMealPlansMealsDBService.createMeal(planId, label, time);
        if (!meal) return res.status(500).json({ success: false, error: 'Failed to create meal' });

        return res.status(200).json({ success: true, meal });
    }

    static async deleteMeal(req, res) {
        const { mealId } = req.body;
        if (!mealId)
            return res.status(400).json({ success: false, error: 'mealId is required' });

        const success = await NutritionMealPlansMealsDBService.deleteMeal(mealId);
        if (!success)
            return res.status(404).json({ success: false, error: 'Meal not found' });

        return res.status(200).json({ success: true });
    }

    static async updateMeal(req, res) {
        const { mealId, newLabel, newTime } = req.body;
        if (!mealId)
            return res.status(400).json({ success: false, error: 'Missing required fields' });

        const meal = await NutritionMealPlansMealsDBService.updateMeal(mealId, newLabel, newTime);
        if (!meal)
            return res.status(404).json({ success: false, error: 'Meal not found or could not update' });

        return res.status(200).json({ success: true, meal });
    }
}