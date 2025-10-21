import ExercisesDBService from './exercises-db-service.js';

export default class ExercisesController {
    static async getExercises(req, res) {
        const id = req.params.id;

        const result = await ExercisesDBService.fetchExercises(id);
        if (result === null) return res.status(500).json({ success: false, error: "Failed to create exercise" });

        return res.status(200).json({ success: true, exercises: result });
    }

    static async createExercise(req, res) {
        const details = req.body;

        const result = await ExercisesDBService.createExercise(details);
        if (result === null) return res.status(500).json({ success: false, error: "Failed to create exercise" });

        return res.status(200).json({ success: true, exercise: result });
    }

    static async updateExercise(req, res) {
        const details = req.body;

        const result = await ExercisesDBService.updateExercise(details);
        if (result === null) return res.status(500).json({ success: false, error: "Failed to create exercise" });

        return res.status(200).json({ success: true, exercise: result });
    }

    static async updateExerciseSets(req, res) {
        const details = req.body;

        const result = await ExercisesDBService.updateExerciseSets(details);
        if (result === null) return res.status(500).json({ success: false, error: "Failed to create exercise" });

        return res.status(200).json({ success: true, exercise: result });
    }

    static async deleteExercise(req, res) {
        const { exerciseId } = req.body;

        const result = await ExercisesDBService.deleteExercise(exerciseId);
        if (!result) return res.status(500).json({ success: false, error: "Failed to delete exercise" });

        return res.status(200).json({ success: true });
    }

    static async createBulkExercises(req, res) {
        const details = req.body;

        const result = await ExercisesDBService.createBulkExercises(details);
        if (result === null) return res.status(500).json({ success: false, error: "Failed to create exercise" });

        return res.status(200).json({ success: true, exercises: result });
    }
}
