import { signJwt } from "../../utils/jwt-utils.js";
import EmailService from "../email/email-service.js";
import NotificationsDBService from "../notifications/notifications-db-service.js";
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

    static async getMultipleUserProfiles(req, res) {
        const idList = req.body;

        const profiles = await UserToUserDBService.fetchMultipleUserProfiles(idList, false);
        if (!profiles) return res.status(404).json({ message: "User not found." });

        return res.status(200).json({ success: true, profiles });
    }

    static async sendFriendRequest(req, res) {
        const details = req.body;

        const response = await UserToUserDBService.sendFriendRequest(details);
        if (!response.success) return res.status(400).json({ success: false, message: response.message });

        return res.status(200).json({ success: true, message: "Friend request sent" });
    }

    static async replyToFriendRequest(req, res) {
        const details = req.body;

        const response = await UserToUserDBService.replyToFriendRequest(details);
        if (!response.success) return res.status(400).json({ message: response.message });

        const receiver = await UserToUserDBService.fetchUserProfile(details.receiverId, false);

        const adderPayload = {
            userId: details.adderId,
            notification: `${receiver.firstname} ${receiver.lastname} ${details.reply} your friend request`,
            seen: false,
            dateOfCreation: new Date()
        }

        await NotificationsDBService.pushNotification(adderPayload);

        const receiverPayload = {
            userId: details.receiverId,
            notification: `You ${reply === 'declined' ? 'rejected' : 'confirmed'} ${adder.firstname} ${adder.lastname}'s friend request`,
            seen: false,
            dateOfCreation: new Date()
        }
        
        await NotificationsDBService.pushNotification(receiverPayload);

        return res.status(200).json({ success: true, message: response.message, id: response.id });
    }
}
