import { signJwt } from "../../utils/jwt-utils.js";
import ChatDBService from "../socket/chat-db-service.js";
import EmailService from "../email/email-service.js";
import NotificationsDBService from "../notifications/notifications-db-service.js";
import NutritionDaysDBService from "../nutrition/days/nutrition-days-db-service.js";
import NutritionFoodsDBService from "../nutrition/foods/nutrition-foods-db-service.js";
import NutritionMealPlansDBService from "../nutrition/meal-plans/nutrition-meal-plans-db-service.js";
import UserToUserDBService from "./verification-db-service.js";
import SocketController from "../socket/socket-controller.js";
import VerificationDBService from "./verification-db-service.js";

export default class VerificationController {
    static async createApplication(req, res) {
        const details = req.body;

        const result = await VerificationDBService.createApplication(details);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json({ success: true, message: result.message, applicationId: result.applicationId });
    }

    static async updateApplication(req, res) {
        const details = req.body;

        const result = await VerificationDBService.updateApplication(details);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json({ success: true, message: result.message, applicationId: result.applicationId });
    }

    static async cancelApplication(req, res) {
        const { applicationId } = req.body;

        const result = await VerificationDBService.cancelApplication(applicationId);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json({ success: true, message: result.message });
    }

    static async getApplications(req, res){
        const userId = req.params.id;

        const result = await VerificationDBService.fetchApplicationsByUserId(userId);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json({ success: true, applications: result.applications });
    }
}