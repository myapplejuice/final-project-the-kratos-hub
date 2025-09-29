// nutrition-controller.js
import NutritionDaysDBService from './nutrition-days-db-service.js';

export default class NutritionDaysController {
    static async getAllDays(req, res) {
        const userId = req.id;
        console.log(userId)
        if (!userId) return res.status(401).json({ message: "Unauthorized! No user ID found in token." });

        const days = await NutritionDaysDBService.fetchAllDays(userId);
        if (!days) return res.status(404).json({ message: "No nutrition days found." });

        return res.status(200).json({ success: true, days });
    }

    static async getDayByDate(req, res) {
        const userId = req.id;
        const { date } = req.params;

        if (!userId) return res.status(401).json({ message: "Unauthorized! No user ID found in token." });
        if (!date) return res.status(400).json({ message: "Date parameter is required." });

        const day = await NutritionDaysDBService.fetchDayByDate(userId, date);
        if (!day) return res.status(404).json({ message: "Nutrition day not found for this date." });

        return res.status(200).json({ success: true, day });
    }

    static async insertNewDay(req, res) {
        const userId = req.id;
        const { date } = req.params;
        const payload = req.body;

        if (!userId) return res.status(401).json({ message: "Unauthorized! No user ID found in token." });
        if (!date) return res.status(400).json({ message: "Date parameter is required." });

        const result = await NutritionDaysDBService.insertNewDay(userId, date, payload);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json({ message: "Nutrition day updated successfully!", day: result.day });
    }

    static async updateDay(req, res) {
        const userId = req.id;
        const { date } = req.params;
        const payload = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized! No user ID found in token." });
        }

        if (!date) {
            return res.status(400).json({ message: "Date parameter is required." });
        }

        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).json({ message: "Payload is empty." });
        }

        try {
            const result = await NutritionDaysDBService.updateDay(userId, date, payload);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            return res.status(200).json({
                message: "Nutrition values updated successfully!",
                updatedDays: result.updatedDays
            });
        } catch (err) {
            console.error("Error updating day values:", err);
            return res.status(500).json({ message: "Internal server error.", error: err.message });
        }
    }

    static async updateConsumption(req, res) {
        const userId = req.id;
        const { date } = req.params;
        const payload = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized! No user ID found in token." });
        }

        if (!date) {
            return res.status(400).json({ message: "Date parameter is required." });
        }

        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).json({ message: "Payload is empty." });
        }

        try {
            const result = await NutritionDaysDBService.updateConsumption(userId, date, payload);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            return res.status(200).json({
                message: "Nutrition values updated successfully!",
                updatedDay: result.updated
            });
        } catch (err) {
            console.error("Error updating day values:", err);
            return res.status(500).json({ message: "Internal server error.", error: err.message });
        }
    }

    static async ensureDayAndFutureDays(req, res) {
        const userId = req.id;
        const { date } = req.params;

        if (!userId) return res.status(401).json({ message: "Unauthorized! No user ID found in token." });
        if (!date) return res.status(400).json({ message: "Date parameter is required." });

        try {
            const result = await NutritionDaysDBService.ensureDayAndFutureDays(userId, date);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            return res.status(200).json({ message: "Nutrition day ensured successfully!", newDays: result.newDays });
        } catch (err) {
            console.error("Error ensuring nutrition day:", err);
            return res.status(500).json({ message: "Internal server error.", error: err.message });
        }
    }
}