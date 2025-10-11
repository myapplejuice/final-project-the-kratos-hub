import { Router } from 'express';
import UserRouter from './user-router.js';
import NutritionRouter from './nutrition-router.js';
import TrainingRouter from './training-router.js';
import UserToUserRouter from './user-to-user-router.js';
import NotificationsRouter from './notifications-router.js';
import ChatRouter from './chat-router.js';

export default class ServerRouter {
    static ping(req, res) {
        res.status(200).json({ success: true, message: "pong" });
    }

    static init(io) {
        const userRouter = UserRouter.init();
        const nutritionRouter = NutritionRouter.init();
        const trainingRouter = TrainingRouter.init();
        const userToUserRouter = UserToUserRouter.init();
        const notificationsRouter = NotificationsRouter.init();
        const chatRouter = ChatRouter.init(io);

        const serverRouter = new Router();
        serverRouter.get('/ping', this.ping);
        serverRouter.use('/user', userRouter);
        serverRouter.use('/nutrition', nutritionRouter);
        serverRouter.use('/training', trainingRouter);
        serverRouter.use('/user-to-user', userToUserRouter)
        serverRouter.use('/notifications', notificationsRouter);
        serverRouter.use('/chat', chatRouter); 

        return serverRouter;
    }
}

