import NutritionMealsDBService from "./nutrition-meals-db-service.js";

export default class NutritionMealsController {
    static async createMeal(req, res) {
        const { nutritionLogId, label, time } = req.body;
        if (!nutritionLogId || !label || !time) {
            return res.status(400).json({ success: false, error: "nutritionLogId and label are required" });
        }

        const meal = await NutritionMealsDBService.createMeal(nutritionLogId, label, time);
        if (!meal) return res.status(500).json({ success: false, error: "Failed to create meal" });

        return res.status(200).json({ success: true, meal });
    }

    static async deleteMeal(req, res) {
        const { mealId } = req.body;
        if (!mealId) return res.status(400).json({ success: false, error: "mealId is required" });

        const success = await NutritionMealsDBService.deleteMeal(mealId);
        if (!success) return res.status(404).json({ success: false, error: "Meal not found" });

        return res.status(200).json({ success: true });
    }

    static async updateMealLabel(req, res) {
        const { mealId, newLabel } = req.body;
        if (!mealId || !newLabel) return res.status(400).json({ success: false, error: 'mealId and newLabel are required' });

        const meal = await NutritionMealsDBService.updateMealLabel(mealId, newLabel);
        if (!meal) return res.status(404).json({ success: false, error: 'Meal not found or could not update' });

        return res.status(200).json({ success: true, meal });
    }

    static async multiCreateMeals(req, res) {
        const { nutritionLogId, meals } = req.body;
        if (!nutritionLogId || !meals) return res.status(400).json({ success: false, error: "nutritionLogId and meals are required" });

        const result = await NutritionMealsDBService.multiCreateMeals(nutritionLogId, meals);
        if (!result) return res.status(500).json({ success: false, error: "Failed to create meals" });

        return res.status(200).json({ success: true, result });
    }
}
