import { Router } from 'express';
import ExercisesController from '../models/training/exercises-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import WorkoutsController from '../models/training/workouts/workouts-controller.js';
import WorkoutsExercisesController from '../models/training/workouts/workouts-exercises/workouts-exercises-controller.js';

export default class TrainingRouter {
    static trainingRouter;

    static init() {
        this.trainingRouter = Router();
        const { asyncHandler, tokenAuthorization, userAuthorization } = MiddlewaresManager;

        this.trainingRouter.get('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.getExercises));
        this.trainingRouter.post('/exercise/bulk/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.createBulkExercises));
        this.trainingRouter.post('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.createExercise));
        this.trainingRouter.put('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.updateExercise));
        this.trainingRouter.put('/exercise/sets/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.updateExerciseSets));
        this.trainingRouter.delete('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.deleteExercise));

        this.trainingRouter.get('/workout/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsController.getWorkouts));
        this.trainingRouter.post('/workout/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsController.createWorkout));
        this.trainingRouter.put('/workout/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsController.updateWorkout));
        this.trainingRouter.delete('/workout/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsController.deleteWorkout));

        
        this.trainingRouter.post('/workout/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsExercisesController.createExercise));
        this.trainingRouter.put('/workout/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsExercisesController.updateExercise));
        this.trainingRouter.delete('/workout/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsExercisesController.deleteExercise));

        return this.trainingRouter;
    }
}
