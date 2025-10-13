import Server from "../../server.js";
import UserToUserDBService from "../user-to-user/user-to-user-db-service.js";
import ChatDBService from "./chat-db-service.js";

export default class SocketController {
    static async sendMessage(payload) {
        const io = Server.getIoSocket();
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

    static emitNotification(userId, payload) {
        const io = Server.getIoSocket();
        io.to(userId).emit('new-notification', payload);
    }

    static emitFriendRequest(userId, payload) {
        const io = Server.getIoSocket();
        io.to(userId).emit('new-friend-request', payload);
    }

    static async emitFriendRequestResponse(reply = '', userId, friendId) {
        const io = Server.getIoSocket();
        let payload = {};
        if (reply === 'accepted') {
            const userFriend = await UserToUserDBService.fetchUserFriend(userId, friendId);
            const newFriendSummary = await ChatDBService.fetchSingleFriendMessageSummary(userId, friendId);
            const friendSummary = {
                ...userFriend,
                lastMessageSenderId: newFriendSummary?.lastMessageSenderId || null,
                lastMessage: newFriendSummary?.lastMessage || null,
                lastMessageTime: newFriendSummary?.lastMessageTime || null,
                unreadCount: newFriendSummary?.unreadCount || 0,
                chatRoomId: newFriendSummary?.chatRoomId
            }
            payload = {
                status: 'accepted',
                friendSummary,
                friendId
            }
        } else {
            payload = {
                status: 'declined',
                friendId
            }
        }
        io.to(userId).emit('new-friend-response', payload);
    }

    static emitNewFriendStatus(status, userId, friendId) {
        const io = Server.getIoSocket();
        io.to(userId).emit('new-friend-status', { status, friendId });
    }
}
