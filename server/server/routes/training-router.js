import { Router } from 'express';
import TrainingController from '../models/training/training-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';

export default class TrainingRouter {
    static trainingRouter;

    static init() {
        this.trainingRouter = Router();
        const { asyncHandler, tokenAuthorization, userAuthorization } = MiddlewaresManager;

        this.trainingRouter.post('/create-exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.createExercise));
        this.trainingRouter.update('/update-exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.updateExercise));
        this.trainingRouter.delete('/delete-exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.deleteExercise));

        this.trainingRouter.post('/create-set/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.createSet));
        this.trainingRouter.update('/update-set/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.updateSet));
        this.trainingRouter.delete('/delete-set/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.deleteSet));

        return this.trainingRouter;
    }
}
