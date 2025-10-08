import TrainingDBService from './training-db-service.js';

export default class TrainingController {
    static async getMasterExercises(req, res) {
        try {
            const exercises = await TrainingDBService.fetchMasterExercises();

            res.status(200).json({ success: true, exercises });
        } catch (err) {
            console.error("getMasterExercises error:", err);
            res.status(500).json({ success: false, message: "Failed to fetch exercises" });
        }
    }

    static async getSession(req, res) {
        try {
            const { sessionId } = req.body;

            const session = await TrainingDBService.fetchSession(sessionId);
            if (!session) return res.status(404).json({ success: false, message: "Session not found" });

            res.status(200).json({ success: true, session });
        } catch (err) {
            console.error("getSession error:", err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getAllSessions(req, res) {
        try {
            const userId = req.params.id;

            const sessions = await TrainingDBService.fetchAllSessions(userId);

            res.json({ success: true, sessions });
        } catch (err) {
            console.error("getAllSessions error:", err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async startSession(req, res) {
        try {
            const userId = req.params.id;

            const result = await TrainingDBService.startSession(userId);

            res.json({ success: true, sessionId: result.sessionId });
        } catch (err) {
            console.error("startSession error:", err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async addExercise(req, res) {
        try {
            const { sessionId, exerciseName } = req.body;
            if (!exerciseName) return res.status(400).json({ success: false, message: "Exercise name required" });

            const result = await TrainingDBService.addExercise(sessionId, exerciseName);

            res.json({ success: true, exerciseId: result.exerciseId });
        } catch (err) {
            console.error("addExercise error:", err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async addSet(req, res) {
        try {
            const { exerciseId, weight, reps, note } = req.body;

            const result = await TrainingDBService.addSet(exerciseId, weight, reps, note);

            res.json({ success: result, message: result ? "Set added successfully" : "Failed to add set" });
        } catch (err) {
            console.error("addSet error:", err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
}
