import { Router } from 'express';
import UserRouter from './user-router.js';
import NutritionRouter from './nutrition-router.js';
import TrainingRouter from './training-router.js';

export default class ServerRouter {
    static serverRouter;

    static ping(req, res) {
        res.status(200).json({ success: true, message: "pong" });
    }

    static init() {
        const userRouter = UserRouter.init();
        const nutritionRouter = NutritionRouter.init();
        const trainingRouter = TrainingRouter.init();

        this.serverRouter = new Router();
        this.serverRouter.get('/ping', this.ping);
        this.serverRouter.use('/user', userRouter);
        this.serverRouter.use('/nutrition', nutritionRouter);
        this.serverRouter.use('/training', trainingRouter);

        return this.serverRouter;
    }
}

