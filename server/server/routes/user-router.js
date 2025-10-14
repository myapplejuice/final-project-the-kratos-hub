import { Router } from 'express';
import UserController from '../models/user/user-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import UserTrainerProfileController from '../models/user/user-trainer-profile/user-trainer-profile-controller.js';

export default class UserRouter {
    static userRouter;

    static init() {
        this.userRouter = Router();
        const asyncHandler = MiddlewaresManager.asyncHandler;
        const tokenAuthorization = MiddlewaresManager.tokenAuthorization;
        const userAuthorization = MiddlewaresManager.userAuthorization;


        this.userRouter.post('/create', asyncHandler(UserController.createUser));
        this.userRouter.post('/login', asyncHandler(UserController.loginUser));

        this.userRouter.post('/recovery/send-code', asyncHandler(UserController.emailRecoveryCode));

        this.userRouter.get('/profile', tokenAuthorization, asyncHandler(UserController.getProfile));

        this.userRouter.delete('/delete/:id', tokenAuthorization, userAuthorization, asyncHandler(UserController.destroyAccount));

        this.userRouter.put('/update/:id', tokenAuthorization, userAuthorization, asyncHandler(UserController.updateUser));
        this.userRouter.put('/recovery/update-password', tokenAuthorization, asyncHandler(UserController.updateUserByRecovery));

        this.userRouter.get("/trainer-profile/:id", tokenAuthorization, userAuthorization, UserTrainerProfileController.getTrainerProfile);
        this.userRouter.put("/trainer-profile/:id", tokenAuthorization, userAuthorization, UserTrainerProfileController.updateTrainerProfile);

        return this.userRouter;
    }
}
