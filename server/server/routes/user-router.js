import { Router } from 'express';
import UserController from '../models/user/user-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';

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
        this.userRouter.get('/another-profile/:id', tokenAuthorization, asyncHandler(UserController.getAnotherUserProfile));

        this.userRouter.delete('/delete/:id', tokenAuthorization, userAuthorization, asyncHandler(UserController.destroyAccount));

        this.userRouter.put('/update/:id', tokenAuthorization, userAuthorization, asyncHandler(UserController.updateUser));
        this.userRouter.put('/recovery/update-password', tokenAuthorization, asyncHandler(UserController.updateUserByRecovery));

        return this.userRouter;
    }
}
