import ChatDBService from "./chat-db-service.js";

export default class ChatController {
    static async sendMessage(io, payload) {
        const details = payload;

        const savedMessageId = await ChatDBService.insertMessage(details);
        io.to(details.chatRoomId).emit('new-message', { id: savedMessageId, ...details });

        return savedMessageId;
    }
}