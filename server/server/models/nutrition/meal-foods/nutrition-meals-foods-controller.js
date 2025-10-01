import NutritionMealsFoodsDBService from "./nutrition-meals-foods-db-service.js";

export default class NutritionMealsFoodsController {
    static async addFood(req, res) {
        const { food } = req.body;
        console.log(food)
        if (!food) return res.status(400).json({ success: false, error: "food is required" });

        const result = await NutritionMealsFoodsDBService.addFood(food);
        if (result === false) return res.status(500).json({ success: false, error: "Failed to add food to meal" });

        return res.status(200).json({ success: true, id: result });
    }

    static async deleteFood(req, res) {
        const { mealId, foodId } = req.body;
        if (!mealId || !foodId) return res.status(400).json({ success: false, error: "mealId and foodId are required" });

        const success = await NutritionMealsFoodsDBService.deleteFood(mealId, foodId);
        if (!success) return res.status(500).json({ success: false, error: "Failed to remove food from meal" });

        return res.status(200).json({ success: true });
    }

    static async updateFood(req, res) {
        const { food } = req.body;
        if (!food) return res.status(400).json({ success: false, error: "mealId and food are required" });

        const result = await NutritionMealsFoodsDBService.updateFood(food);
        if (result === false) return res.status(500).json({ success: false, error: "Failed to update food in meal" });

        return res.status(200).json({ success: true, id: result });
    }
}
