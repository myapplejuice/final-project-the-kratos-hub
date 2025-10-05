import NutritionMealPlansDBService from "./nutrition-meal-plans-db-service.js";

export default class NutritionMealPlansController {
    static async createPlan(req, res) {
        const userId = req.id;
        const details = req.body;

        const plan = await NutritionMealPlansDBService.createPlan(userId, details);
        if (!plan) return res.status(500).json({ success: false, error: "Failed to create meal" });

        return res.status(200).json({ success: true, plan });
    }

    static async deletePlan(req, res) {
        const { planId } = req.body;
        if (!planId) return res.status(400).json({ success: false, error: "planId is required" });

        const success = await NutritionMealPlansDBService.deletePlan(planId);
        if (!success) return res.status(404).json({ success: false, error: "Plan not found" });

        return res.status(200).json({ success: true });
    }

    static async updatePlan(req, res) {
        const { planId, newLabel, newDescription } = req.body;
        if (!planId || !newLabel || !newDescription) return res.status(400).json({ success: false, error: 'planId and newLabel and newDescription are required' });

        const plan = await NutritionMealPlansDBService.updatePlan(planId, newLabel, newDescription);
        if (!plan) return res.status(404).json({ success: false, error: 'Meal not found or could not update' });

        return res.status(200).json({ success: true, plan });
    }
}
