import ChatDBService from "./chat-db-service.js";

export default class ChatController {
    static async sendMessage(io, payload) {
console.log(payload)
        //const savedMessage = await ChatDBService.createMessage(details);
        //io.to(chatRoomId).emit('new-message', { id: savedMessage.id, ...details });

        return;
    }
}