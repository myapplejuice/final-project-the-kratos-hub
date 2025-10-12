import ChatDBService from "./chat-db-service.js";

export default class SocketController {
    static async sendMessage(io, payload) {
        const savedMessageId = await ChatDBService.insertMessage(payload);
        payload.id = savedMessageId;

        io.to(payload.chatRoomId).emit('new-message', payload);

        const receiverSockets = Array.from(io.sockets.sockets.values());
        const receiverInChat = receiverSockets.some(s => s.userId === payload.receiverId && s.rooms.has(payload.chatRoomId));

        if (!receiverInChat) {
            io.to(payload.receiverId).emit('new-message', payload);
        }

        return savedMessageId;
    }
}
