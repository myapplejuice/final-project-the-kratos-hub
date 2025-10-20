import { Router } from 'express';
import TrainingController from '../models/training/training-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';

export default class TrainingRouter {
    static trainingRouter;

    static init() {
        this.trainingRouter = Router();
        const { asyncHandler, tokenAuthorization, userAuthorization } = MiddlewaresManager;

        this.trainingRouter.get('/create-exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.getExercises));
        this.trainingRouter.post('/create-exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.createExercise));
        this.trainingRouter.update('/update-exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.updateExercise));
        this.trainingRouter.delete('/delete-exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.deleteExercise));

        return this.trainingRouter;
    }
}
