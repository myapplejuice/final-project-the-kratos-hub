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
        this.userToUserRouter.post('/request-friend/:id', tokenAuthorization, userAuthorization, asyncHandler(UserToUserController.sendFriendRequest));
        //this.userToUserRouter.post('/reply-friend/:id', tokenAuthorization, userAuthorization, asyncHandler(UserToUserController.replyToFriendRequest));
        //this.userToUserRouter.get('/friends-list/:id', tokenAuthorization, userAuthorization, asyncHandler(UserToUserController.getFriendsList));
        //this.userToUserRouter.get('/friend-requests/:id', tokenAuthorization, userAuthorization, asyncHandler(UserToUserController.getFriendRequests));


        return this.userToUserRouter;
    }
}
