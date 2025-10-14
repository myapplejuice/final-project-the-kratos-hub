import UserTrainerProfileDBService from "./user-trainer-profile-db-service.js";

export default class UserTrainerProfileController {
    constructor() { }

    static async getTrainerProfile(req, res) {
        const id = body.userId;

        const result = await UserTrainerProfileDBService.fetchTrainerProfile(id);
        if (!result) return res.status(404).json({ message: "Trainer profile not found!" });

        return res.status(200).json({ profile: result });
    }

    static async updateTrainerProfile(req, res) {
        const id = req.id;
        const payload = req.body;

        const result = await UserTrainerProfileDBService.updateTrainerProfile(id, payload);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        return res.status(200).json({ message: "Trainer profile updated successfully!" });
    }
}
