import { Router } from 'express';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import AdminController from '../models/admin/admin-controller.js';

export default class AdminRouter {
    static adminRouter;

    static init() {
        this.adminRouter = Router();
        const asyncHandler = MiddlewaresManager.asyncHandler;
        const adminAuthorization = MiddlewaresManager.adminAuthorization;

        this.adminRouter.get('/test-token/:id', adminAuthorization, asyncHandler(AdminController.testAdminToken));
        this.adminRouter.post('/access', asyncHandler(AdminController.access));

        this.adminRouter.get('/users/:id', adminAuthorization, asyncHandler(AdminController.getUsers));
        this.adminRouter.delete('/users/terminate/:id', adminAuthorization, asyncHandler(AdminController.terminateUser));
        this.adminRouter.post('/users/notify/:id', adminAuthorization, asyncHandler(AdminController.notifyUser));

        this.adminRouter.post('/user/reputation-profile/:id', adminAuthorization, asyncHandler(AdminController.getUserReputationProfile));

        return this.adminRouter;
    }
}