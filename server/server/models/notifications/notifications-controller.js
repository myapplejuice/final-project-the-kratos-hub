import { signJwt } from "../../utils/jwt-utils.js";
import EmailService from "../email/email-service.js";
import NotificationsDBService from "./notifications-db-service.js";

export default class NotificationsController {
    static async fetchNotifications(req, res) {
        const userId = req.id;

        const notifications = await NotificationsDBService.fetchNotifications(userId);
        if (!notifications) return res.status(400).json({ success: false, notifications: [] });

        return res.status(200).json({ success: true, notifications });
    }

    static async pushNotification(req, res) {
        const details = req.body;

        const success = await NotificationsDBService.pushNotification(details);
        if (!success) return res.status(500).json({ success: false, error: "Failed to push notification" });

        return res.status(200).json({ success: true });
    }

    static async setNotificationsSeen(req, res) {
        const details = req.body;
        
        const success = await NotificationsDBService.setNotificationsSeen(details);
        if (!success) return res.status(500).json({ success: false, error: "Failed to set notification seen" });

        return res.status(200).json({ success: true });
    }
}
