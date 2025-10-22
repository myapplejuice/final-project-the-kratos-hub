import { signJwt } from "../../utils/jwt-utils.js";
import ChatDBService from "../socket/chat-db-service.js";
import EmailService from "../email/email-service.js";
import NotificationsDBService from "../notifications/notifications-db-service.js";
import NutritionDaysDBService from "../nutrition/days/nutrition-days-db-service.js";
import NutritionFoodsDBService from "../nutrition/foods/nutrition-foods-db-service.js";
import NutritionMealPlansDBService from "../nutrition/meal-plans/nutrition-meal-plans-db-service.js";
import UserToUserDBService from "./user-to-user-db-service.js";
import SocketController from "../socket/socket-controller.js";
import UserTrainerProfileDBService from "../user/user-trainer-profile/user-trainer-profile-db-service.js";

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

        details.id = response.newFriendRequestId;
        SocketController.emitFriendRequest(details.receiverId, details);

        return res.status(200).json({ success: true, message: "Friend request sent" });
    }

    static async replyToFriendRequest(req, res) {
        const details = req.body;

        console.log(details)
        const response = await UserToUserDBService.replyToFriendRequest(details);
        if (!response.success) return res.status(400).json({ message: response.message });

        const receiver = await UserToUserDBService.fetchUserProfile(details.receiverId, false);

        const adderPayload = {
            userId: details.adderId,
            notification: `${receiver.firstname} ${receiver.lastname} ${details.reply} your friend request`,
            seen: false,
            clickable: true,
            clickableInfo: JSON.stringify({ userId: details.receiverId }),
            clickableDestination: 'profile',
            sentiment: "normal",
            dateOfCreation: new Date()
        }

        const id = await NotificationsDBService.pushNotification(adderPayload);
        adderPayload.id = id;
        adderPayload.clickableInfo = JSON.parse(adderPayload.clickableInfo);
        SocketController.emitNotification(details.adderId, adderPayload);
        await SocketController.emitFriendRequestResponse(details.reply, details.adderId, details.receiverId);

        const trainerProfile = await UserTrainerProfileDBService.fetchTrainerProfile(details.receiverId);

        return res.status(200).json({ success: true, message: response.message, id: response.id, chatRoomId: response.newChatId, trainerProfile });
    }

    static async disableFriendship(req, res) {
        const details = req.body;

        const response = await UserToUserDBService.disableFriendship(details.id, details.terminatorId);
        if (!response.success) return res.status(400).json({ message: response.message });

        const terminatorProfile = await UserToUserDBService.fetchUserProfile(details.terminatorId, false);

        const payload = {
            userId: details.friendId,
            notification: `${terminatorProfile.firstname} ${terminatorProfile.lastname} terminated their friendship with you, if they revert this action, you will be notified`,
            seen: false,
            clickable: true,
            clickableInfo: JSON.stringify({ userId: details.terminatorId }),
            clickableDestination: 'profile',
            sentiment: "negative",
            dateOfCreation: new Date()
        }

        const id = await NotificationsDBService.pushNotification(payload);
        payload.id = id;
        payload.clickableInfo = JSON.parse(payload.clickableInfo);
        SocketController.emitNotification(details.friendId, payload);
        SocketController.emitNewFriendStatus('inactive', details.friendId, details.terminatorId);

        return res.status(200).json({ success: true, message: response.message });
    }

    static async restoreFriendship(req, res) {
        const details = req.body;

        const response = await UserToUserDBService.restoreFriendship(details.id);
        if (!response.success) return res.status(400).json({ message: response.message });

        const restorerId = await UserToUserDBService.fetchUserProfile(details.restorerId, false);

        const payload = {
            userId: details.friendId,
            notification: `${restorerId.firstname} ${restorerId.lastname} restored their friendship with you, you can contact them again`,
            seen: false,
            sentiment: "positive",
            clickable: true,
            clickableInfo: JSON.stringify({ userId: details.restorerId }),
            clickableDestination: 'profile',
            dateOfCreation: new Date()
        }

        const id = await NotificationsDBService.pushNotification(payload);
        payload.id = id;
        payload.clickableInfo = JSON.parse(payload.clickableInfo);
        SocketController.emitNotification(details.friendId, payload);
        SocketController.emitNewFriendStatus('active', details.friendId, details.restorerId);

        return res.status(200).json({ success: true, message: response.message });
    }

    static async getChatMessages(req, res) {
        const details = req.body;

        const response = await ChatDBService.fetchUserMessages(details.userId, details.friendId, details.page);

        return res.status(200).json({ success: true, messages: response.messages, page: response.page, hasMore: response.hasMore });
    }
}
