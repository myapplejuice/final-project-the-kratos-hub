import NutritionFoodsDBService from "./nutrition-foods-db-service.js";

export default class NutritionFoodsController {
    static async allFoods(req, res) {
        const userId = req.params.id;

        const foods = await NutritionFoodsDBService.fetchFoods(userId);
        if (!foods) return res.status(500).json({ success: false, error: "Failed to fetch foods" });

        return res.status(200).json({ success: true, foods });
    }
    static async createFood(req, res) {
        const userId = req.params.id;
        const payload = req.body;

        const food = await NutritionFoodsDBService.createFood(userId, payload);
        if (!food) return res.status(500).json({ success: false, error: "Failed to create food" });

        return res.status(200).json({ success: true, food });
    }

    static async updateFood(req, res) {
        const payload = req.body;
        
        const food = await NutritionFoodsDBService.updateFood(payload);
        if (!food) return res.status(404).json({ success: false, error: "Food not found or could not update" });

        return res.status(200).json({ success: true, food });
    }

    static async deleteFood(req, res) {
        const { foodId } = req.body;

        const success = await NutritionFoodsDBService.deleteFood(foodId);
        if (!success) return res.status(404).json({ success: false, error: "Food not found" });

        return res.status(200).json({ success: true });
    }
}
