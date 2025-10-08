import { signJwt } from "../../utils/jwt-utils.js";
import EmailService from "../email/email-service.js";
import NutritionDaysDBService from "../nutrition/days/nutrition-days-db-service.js";
import NutritionFoodsDBService from "../nutrition/foods/nutrition-foods-db-service.js";
import NutritionMealPlansDBService from "../nutrition/meal-plans/nutrition-meal-plans-db-service.js";
import NotificationsDBService from "./notifications-db-service.js";
import UserToUserDBService from "./user-to-user-db-service.js";

export default class NotificationsController {
    static async fetchNotifications(req, res) {
        const userId = req.id;

        const notifications = await NotificationsDBService.fetchNotifications(userId);
        if (!notifications) return res.status(400).json({ success: false, notifications: [] });

        return res.status(200).json({ success: true, notifications });
    }

    static async pushNotification(req,res){
        const details = req.body;

        const success = await NotificationsDBService.pushNotification(details);
        if (!success) return res.status(500).json({ success: false, error: "Failed to push notification" });

        return res.status(200).json({ success: true });
    }

    static async setNotificationSeen(req, res) {
        const { id } = req.body;
        
        const success = await NotificationsDBService.setNotificationSeen(id);
        if (!success) return res.status(500).json({ success: false, error: "Failed to set notification seen" });

        return res.status(200).json({ success: true });
    }
}
