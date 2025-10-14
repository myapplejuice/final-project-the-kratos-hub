import UserDBService from "./user-db-service.js";
import { signJwt } from "../../utils/jwt-utils.js";
import EmailService from "../email/email-service.js";
import NutritionDaysDBService from "../nutrition/days/nutrition-days-db-service.js";
import NutritionFoodsDBService from "../nutrition/foods/nutrition-foods-db-service.js";
import NutritionMealPlansDBService from "../nutrition/meal-plans/nutrition-meal-plans-db-service.js";
import UserToUserDBService from "../user-to-user/user-to-user-db-service.js";
import NotificationsDBService from "../notifications/notifications-db-service.js";
import ChatDBService from "../socket/chat-db-service.js";
import UserTrainerProfileDBService from "./user-trainer-profile/user-trainer-profile-db-service.js";

export default class UserController {
    constructor() { }

    static async createUser(req, res) {
        const response = await UserDBService.insertUser(req.body);

        if (!response) return res.status(500).json({ message: "Internal server error!" });
        if (!response?.success) {
            return res.status(400).json({ message: response.message });
        }

        const token = signJwt({ id: response.id });

        return res.status(200).json({ token });
    }

    static async loginUser(req, res) {
        const response = await UserDBService.fetchUserId(req.body);

        if (!response) return res.status(500).json({ result: false, message: "Internal server error!" });
        if (!response?.success) return res.status(401).json({ result: false, message: response.message });

        const token = signJwt({ id: response.id });

        return res.status(200).json({ token });
    }

    static async getProfile(req, res) {
        const id = req.id;

        if (!id) {
            return res
                .status(401)
                .json({ message: "Unauthorized! No user ID found in token." });
        }

        const profile = await UserDBService.fetchUserProfile(id);
        if (!profile) {
            return res.status(404).json({ message: "User not found." });
        }

        const [trainerProfile, nutritionLogs, foods, plans,
            friends, pendingFriends, friendMessageSummaries, notifications
        ] = await Promise.all([
            UserTrainerProfileDBService.fetchTrainerProfile(id),
            NutritionDaysDBService.fetchAllDays(id),
            NutritionFoodsDBService.fetchFoods(id),
            NutritionMealPlansDBService.fetchPlansByUserId(id),
            UserToUserDBService.fetchUserFriendsList(id),
            UserToUserDBService.fetchUserPendingFriendsList(id),
            ChatDBService.fetchFriendMessageSummaries(id),
            NotificationsDBService.fetchNotifications(id)
        ]);

        profile.trainerProfile = trainerProfile;
        profile.nutritionLogs = nutritionLogs;
        profile.foods = foods;
        profile.plans = plans;
        profile.friends = friends;
        profile.pendingFriends = pendingFriends;
        profile.notifications = notifications;

        profile.friends = await Promise.all(
            profile.friends.map(async (friend) => {
                const summary = friendMessageSummaries.find(s => s.friendId === friend.friendId);
                const trainerProfile = await UserTrainerProfileDBService.fetchTrainerProfile(friend.friendId);
           
                return {
                    ...friend,
                    trainerProfile,
                    lastMessageSenderId: summary?.lastMessageSenderId || null,
                    lastMessage: summary?.lastMessage || null,
                    lastMessageTime: summary?.lastMessageTime || null,
                    unreadCount: summary?.unreadCount || 0,
                    chatRoomId: summary?.chatRoomId
                };
            })
        );

        return res.status(200).json({ profile });
    }

    static async emailRecoveryCode(req, res) {
        const { email, recoveryCode } = req.body;

        const emailExists = await UserDBService.checkEmailExistence(email);
        if (!emailExists) {
            return res.status(404).json({ message: 'No account matched with this email address!' });
        }

        const subject = "Password recovery - The Kratos Hub";
        const text = `Your password recovery code is:\n${recoveryCode}\nPlease enter this code in the app to start the password recovery process!`;
        const emailSent = await EmailService.sendEmail({ to: email, subject, text });

        if (!emailSent) return res.status(500).json({ message: "Failed to send recovery email!" });

        const token = signJwt({ email });
        return res.status(200).json({ token });
    }

    static async updateUserByRecovery(req, res) {
        const { email, password } = req.body;

        const updatedUser = await UserDBService.updatePasswordByEmail(email, password);

        if (!updatedUser) {
            return res
                .status(404)
                .json({ message: "No user with this email exists!" });
        }

        return res.status(200).json({ message: "Password successfully changed!" });
    }

    static async updateUser(req, res) {
        const { id } = req.params;
        const payload = req.body;

        const result = await UserDBService.updateUser(id, payload);
        if (!result.success)
            return res.status(400).json({ message: result.message });

        return res.status(200).json({ message: "Update successful!" });
    }

    static async destroyAccount(req, res) {
        const id = req.params.id;
        const { password } = req.body;

        const response = await UserDBService.destroyAccount(id, password);

        if (!response.success) {
            return res
                .status(500)
                .json({ message: response.message });
        }

        return res.status(200).json({ message: "Account deleted!" });
    }
}
