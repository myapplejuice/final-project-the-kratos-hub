import NutritionMealFoodsDBService from "./nutrition-meal-foods-db-service.js";

export default class NutritionMealFoodsController {
    static async addFood(req, res) {
        const { mealId, food } = req.body;
        if (!mealId || !food) return res.status(400).json({ success: false, error: "mealId and food are required" });

        const success = await NutritionMealFoodsDBService.addFood(mealId, food);
        if (!success) return res.status(500).json({ success: false, error: "Failed to add food to meal" });

        return res.status(200).json({ success: true });
    }

    static async deleteFood(req, res) {
        const { mealId, foodId } = req.body;
        if (!mealId || !foodId) return res.status(400).json({ success: false, error: "mealId and foodId are required" });

        const success = await NutritionMealFoodsDBService.deleteFood(mealId, foodId);
        if (!success) return res.status(500).json({ success: false, error: "Failed to remove food from meal" });

        return res.status(200).json({ success: true });
    }

    static async updateFood(req, res) {
        const { mealId, food } = req.body;
        if (!mealId || !food) return res.status(400).json({ success: false, error: "mealId and food are required" });

        const success = await NutritionMealFoodsDBService.updateFood(mealId, food);
        if (!success) return res.status(500).json({ success: false, error: "Failed to update food in meal" });

        return res.status(200).json({ success: true });
    }
}
