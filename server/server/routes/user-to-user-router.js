import { Router } from 'express';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import UserToUserController from '../models/user-to-user/user-to-user-controller.js';

export default class UserToUserRouter {
    static userToUserRouter;

    static init() {
        this.userToUserRouter = Router();
        const asyncHandler = MiddlewaresManager.asyncHandler;
        const tokenAuthorization = MiddlewaresManager.tokenAuthorization;
        const userAuthorization = MiddlewaresManager.userAuthorization;

        this.userToUserRouter.get('/another-profile/:id', tokenAuthorization, asyncHandler(UserToUserController.getAnotherUserProfile));
        this.userToUserRouter.post('/multiple-another-profile/:id', tokenAuthorization, userAuthorization, asyncHandler(UserToUserController.getMultipleUserProfiles));
        this.userToUserRouter.post('/friend-request/:id', tokenAuthorization, userAuthorization, asyncHandler(UserToUserController.sendFriendRequest));
        this.userToUserRouter.post('/reply-request/:id', tokenAuthorization, userAuthorization, asyncHandler(UserToUserController.replyToFriendRequest));
        this.userToUserRouter.delete('/terminate-friendship/:id', tokenAuthorization, userAuthorization, asyncHandler(UserToUserController.disableFriendship));
        this.userToUserRouter.put('/restore-friendship/:id', tokenAuthorization, userAuthorization, asyncHandler(UserToUserController.restoreFriendship));
        this.userToUserRouter.post('/messages/:id', tokenAuthorization, userAuthorization, asyncHandler(UserToUserController.getChatMessages));

        return this.userToUserRouter;
    }
}
