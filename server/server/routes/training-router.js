import { Router } from 'express';
import TrainingController from '../models/training/training-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';

export default class TrainingRouter {
    static trainingRouter;

    static init() {
        this.trainingRouter = Router();
        const { asyncHandler, tokenAuthorization, userAuthorization } = MiddlewaresManager;

        this.trainingRouter.get('/master-exercises/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.getMasterExercises));
        this.trainingRouter.get('/session/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.getSession));
        this.trainingRouter.get('/sessions/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.getAllSessions));

        this.trainingRouter.post('/start/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.startSession));
        this.trainingRouter.post('/exercise/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.addExercise));
        this.trainingRouter.post('/set/:id', tokenAuthorization, userAuthorization, asyncHandler(TrainingController.addSet));

        return this.trainingRouter;
    }
}
