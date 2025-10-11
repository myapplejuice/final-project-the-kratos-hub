import { Router } from 'express';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import ChatController from '../models/chat/chat-controller.js';

export default class ChatRouter {
    static init(io) {
        const chatRouter = Router();
        const asyncHandler = MiddlewaresManager.asyncHandler;

        chatRouter.post('/send-message', asyncHandler((req, res) => ChatController.sendMessage(io, req, res)));

        return chatRouter;
    }
}
