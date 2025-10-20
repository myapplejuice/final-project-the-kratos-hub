import { Router } from 'express';
import TrainingController from '../models/training/training-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';

export default class TrainingRouter {
    static trainingRouter;

    static init() {
        this.trainingRouter = Router();
        const { asyncHandler, tokenAuthorization, userAuthorization } = MiddlewaresManager;

        this.trainingRouter.get('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.getExercises));
        this.trainingRouter.post('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.createExercise));
        this.trainingRouter.put('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.updateExercise));
        this.trainingRouter.put('/exercise/sets/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.updateExerciseSets));
        this.trainingRouter.delete('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.deleteExercise));

        return this.trainingRouter;
    }
}
