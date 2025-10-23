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
        this.adminRouter.post('/user/warn/:id', adminAuthorization, asyncHandler(AdminController.issueWarning));
        this.adminRouter.post('/user/warnings-history/:id', adminAuthorization, asyncHandler(AdminController.getUserWarningsHistory));
        
        this.adminRouter.get('/applications/:id', adminAuthorization, asyncHandler(AdminController.getApplications));
        this.adminRouter.put('/applications/:id', adminAuthorization, asyncHandler(AdminController.updateApplicationStatus));


        return this.adminRouter;
    }
}