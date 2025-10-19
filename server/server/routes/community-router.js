import { Router } from 'express';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import CommunityController from '../models/community/community-controller.js';

export default class CommunityRouter {
    static communityRouter;

    static init() {
        this.communityRouter = Router();
        const asyncHandler = MiddlewaresManager.asyncHandler;
        const tokenAuthorization = MiddlewaresManager.tokenAuthorization;
        const userAuthorization = MiddlewaresManager.userAuthorization;

        this.communityRouter.post('/post/:id', tokenAuthorization, userAuthorization, asyncHandler(CommunityController.getPost));
        this.communityRouter.post('/posts/:id', tokenAuthorization, userAuthorization, asyncHandler(CommunityController.getPosts));
        this.communityRouter.post('/create/:id', tokenAuthorization, userAuthorization, asyncHandler(CommunityController.createPost));
        this.communityRouter.post('/like/:id', tokenAuthorization, userAuthorization, asyncHandler(CommunityController.likePost));
        this.communityRouter.post('/save/:id', tokenAuthorization, userAuthorization, asyncHandler(CommunityController.savePost));
        this.communityRouter.post('/share/:id', tokenAuthorization, userAuthorization, asyncHandler(CommunityController.sharePost));

        this.communityRouter.put('/update/:id', tokenAuthorization, userAuthorization, asyncHandler(CommunityController.updatePost));
        this.communityRouter.delete('/delete/:id', tokenAuthorization, userAuthorization, asyncHandler(CommunityController.deletePost));

        return this.communityRouter;
    }
}