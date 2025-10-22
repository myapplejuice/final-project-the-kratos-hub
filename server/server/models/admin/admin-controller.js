import AdminDBService from "./admin-db-service.js";
import { signJwt } from "../../utils/jwt-utils.js";
import SocketController from "../socket/socket-controller.js";
import NotificationsDBService from "../notifications/notifications-db-service.js";

export default class AdminController {
    static async testAdminToken(req, res) {
        const { id, permissions } = req.body;

        return res.status(200).json({ success: true, message: "Admin token is valid!", id, permissions });
    }

    static async access(req, res) {
        const { id, pass } = req.body;

        const response = await AdminDBService.access(id, pass);
        if (!response.success) return res.status(400).json({ success: false, message: response.message });

        const tokenPayload = { id: response.admin.id, permissions: response.admin.permissions, isActive: response.admin.isActive };
        const token = signJwt(tokenPayload);

        return res.status(200).json({ success: true, message: response.message, admin: response.admin, token });
    }

    static async getUsers(req, res) {
        const users = await AdminDBService.fetchUsers();
        return res.status(200).json({ success: true, users });
    }

    static async terminateUser(req, res) {
        const { id, isTerminated } = req.body;

        console.log(id, isTerminated);
        const response = await AdminDBService.setTerminated(id, isTerminated);
        if (!response.success) res.status(400).json({ success: false, message: response.message });

        return res.status(200).json({ success: true, message: response.message });
    }

    static async notifyUser(req, res) {
        const { id, message, imagesURLS } = req.body;

        const payload = {
            userId: id,
            notification: `ADMINISTRATION: ${message}`,
            seen: false,
            clickable: true,
            clickableInfo: JSON.stringify({ imagesURLS }),
            clickableDestination: 'admin',
            sentiment: "normal",
            dateOfCreation: new Date()
        }

        const notificationId = await NotificationsDBService.pushNotification(payload);
        payload.id = notificationId;
        payload.clickableInfo = JSON.parse(payload.clickableInfo);
        SocketController.emitNotification(id, payload);

        return res.status(200).json({ success: true, message: response.message });
    }
}
