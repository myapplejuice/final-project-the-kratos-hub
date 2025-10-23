import { Router } from 'express';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import ReportsController from '../models/reports/reports-controller.js';

export default class ReportsRouter {
    static reportsRouter;

    static init() {
        this.reportsRouter = Router();
        const asyncHandler = MiddlewaresManager.asyncHandler;
        const tokenAuthorization = MiddlewaresManager.tokenAuthorization;
        const userAuthorization = MiddlewaresManager.userAuthorization;

        this.reportsRouter.post('/create/:id', tokenAuthorization, userAuthorization, asyncHandler(ReportsController.createReport));
       
        return this.reportsRouter;
    }
}