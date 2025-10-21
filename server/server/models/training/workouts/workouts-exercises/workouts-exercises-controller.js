import WorkoutsExercisesDBService from './workouts-exercises-db-service.js';

export default class WorkoutsExercisesController {
  static async createExercise(req, res) {
    const details = req.body;

    const result = await WorkoutsExercisesDBService.createWorkoutExercise(details);
    if (result === null) return res.status(500).json({ success: false, error: "Failed to create exercise" });

    return res.status(200).json({ success: true, exercise: result });
  }

  static async updateExercise(req, res) {
    const details = req.body;
    console.log(details)

    const result = await WorkoutsExercisesDBService.updateWorkoutExercise(details);
    if (result === null) return res.status(500).json({ success: false, error: "Failed to update exercise" });

    return res.status(200).json({ success: true, exercise: result });
  }

  static async deleteExercise(req, res) {
    const { exerciseId } = req.body;

    const result = await WorkoutsExercisesDBService.deleteWorkoutExercise(exerciseId);
    if (!result) return res.status(500).json({ success: false, error: "Failed to delete exercise" });

    return res.status(200).json({ success: true });
  }
}
