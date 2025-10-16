import { Router } from 'express';
import UserController from '../models/user/user-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import UserTrainerProfileController from '../models/user/user-trainer-profile/user-trainer-profile-controller.js';
import VerificationController from '../models/verification/verification-controller.js';

export default class VerificationRouter {
    static verificationRouter;

    static init() {
        this.verificationRouter = Router();
        const asyncHandler = MiddlewaresManager.asyncHandler;
        const tokenAuthorization = MiddlewaresManager.tokenAuthorization;
        const userAuthorization = MiddlewaresManager.userAuthorization;

        this.verificationRouter.post("/:id", tokenAuthorization, userAuthorization, asyncHandler(VerificationController.createApplication));
        this.verificationRouter.put("/:id", tokenAuthorization, userAuthorization, asyncHandler(VerificationController.updateApplication));
        this.verificationRouter.delete("/:id", tokenAuthorization, userAuthorization, asyncHandler(VerificationController.cancelApplication));
        this.verificationRouter.get("/:id", tokenAuthorization, userAuthorization, asyncHandler(VerificationController.getApplications));

        return this.verificationRouter;
    }
}