import WorkoutsDBService from './workouts-db-service.js';

export default class WorkoutsController {
  static async getWorkouts(req, res) {
    const userId = req.params.id;

    const result = await WorkoutsDBService.fetchWorkouts(userId);
    if (result === null) return res.status(500).json({ success: false, error: "Failed to fetch workouts" });

    return res.status(200).json({ success: true, workouts: result });
  }

  static async createWorkout(req, res) {
    const details = req.body;

    const result = await WorkoutsDBService.createWorkout(details);
    if (result === null) return res.status(500).json({ success: false, error: "Failed to create workout" });

    return res.status(200).json({ success: true, workout: result });
  }

  static async updateWorkout(req, res) {
    const details = req.body;

    const result = await WorkoutsDBService.updateWorkout(details);
    if (result === null) return res.status(500).json({ success: false, error: "Failed to update workout" });

    return res.status(200).json({ success: true, workout: result });
  }

  static async deleteWorkout(req, res) {
    const { workoutId } = req.body;

    const result = await WorkoutsDBService.deleteWorkout(workoutId);
    if (!result) return res.status(500).json({ success: false, error: "Failed to delete workout" });

    return res.status(200).json({ success: true });
  }
}
