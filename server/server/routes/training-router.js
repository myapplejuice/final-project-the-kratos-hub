import { Router } from 'express';
import ExercisesController from '../models/training/exercises-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import WorkoutsController from '../models/training/workouts/workouts-controller.js';

export default class TrainingRouter {
    static trainingRouter;

    static init() {
        this.trainingRouter = Router();
        const { asyncHandler, tokenAuthorization, userAuthorization } = MiddlewaresManager;

        this.trainingRouter.get('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.getExercises));
        this.trainingRouter.post('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.createExercise));
        this.trainingRouter.put('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.updateExercise));
        this.trainingRouter.put('/exercise/sets/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.updateExerciseSets));
        this.trainingRouter.delete('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(ExercisesController.deleteExercise));

        this.trainingRouter.get('/workout/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsController.getWorkouts));
        this.trainingRouter.post('/workout/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsController.createWorkout));
        this.trainingRouter.put('/workout/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsController.updateWorkout));
        this.trainingRouter.delete('/workout/:id', tokenAuthorization, userAuthorization, asyncHandler(WorkoutsController.deleteWorkout));

        return this.trainingRouter;
    }
}
