import { signJwt } from "../../utils/jwt-utils.js";
import EmailService from "../email/email-service.js";
import NutritionDaysDBService from "../nutrition/days/nutrition-days-db-service.js";
import NutritionFoodsDBService from "../nutrition/foods/nutrition-foods-db-service.js";
import NutritionMealPlansDBService from "../nutrition/meal-plans/nutrition-meal-plans-db-service.js";
import UserToUserDBService from "./user-to-user-db-service.js";

export default class UserToUserController {
    static async getAnotherUserProfile(req, res) {
        const id = req.params.id;

        const profile = await UserToUserDBService.fetchUserProfile(id, false);
        if (!profile) return res.status(404).json({ message: "User not found." });

        return res.status(200).json({ success: true, profile });
    }

    static async sendFriendRequest(req, res) {
        const details = req.body;

        const response = await UserToUserDBService.sendFriendRequest(details);
        if (!response.success) return res.status(400).json({ success: false, message: response.message });

        return res.status(200).json({ success: true, message: "Friend request sent" });
    }

    static async replyToFriendRequest(req, res) {
        const id = req.params.id;

        const response = await UserToUserDBService.replyToFriendRequest(req.id, id, req.body);
        if (!response.success) return res.status(400).json({ message: response.message });

        return res.status(200).json({ success: true, message: "Reply sent!" });
    }

    static async getFriendsList(req, res) {
        const id = req.params.id;

        const friends = await UserToUserDBService.fetchFriendsList(id);
        if (!friends) return res.status(404).json({ message: "No friends found." });

        return res.status(200).json({ success: true, friends });
    }

    static async getFriendRequests(req, res) {
        const id = req.params.id;

        const requests = await UserToUserDBService.fetchFriendRequests(id);
        if (!requests) return res.status(404).json({ message: "No friend requests found." });

        return res.status(200).json({ success: true, requests });
    }
}
