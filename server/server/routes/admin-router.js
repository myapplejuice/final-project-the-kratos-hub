import { Router } from 'express';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import AdminController from '../models/admin/admin-controller.js';

export default class AdminRouter {
    static adminRouter;

    static init() {
        this.adminRouter = Router();
        const asyncHandler = MiddlewaresManager.asyncHandler;
        const adminAuthorization = MiddlewaresManager.adminAuthorization;

        this.adminRouter.post('/access/:id', asyncHandler(AdminController.Access));

        return this.adminRouter;
    }
}