import TrainingDBService from './training-db-service.js';

export default class TrainingController {
    static async createExercise(req, res) {
        const details = req.body;

        const result = await TrainingDBService.createExercise(details);
        if (result === null) return res.status(500).json({ success: false, error: "Failed to create exercise" });

        return res.status(200).json({ success: true, exercise: result });
    }

    static async updateExercise(req, res) {
        const details = req.body;

        const result = await TrainingDBService.updateExercise(details);
        if (result === null) return res.status(500).json({ success: false, error: "Failed to create exercise" });

        return res.status(200).json({ success: true, exercise: result });
    }

    static async deleteExercise(req, res) {
        const { exerciseId } = req.body;

        const result = await TrainingDBService.deleteExercise(exerciseId);
        if (!result) return res.status(500).json({ success: false, error: "Failed to delete exercise" });

        return res.status(200).json({ success: true });
    }
}
