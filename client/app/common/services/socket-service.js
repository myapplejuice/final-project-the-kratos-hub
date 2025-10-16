import { io } from "socket.io-client";
import DeviceStorageService from "./device-storage-service";

export default class SocketService {
    static SOCKET_URL = "http://192.168.33.16:8080";
    socket = null;

    static async connect() {
        const token = await DeviceStorageService.getUserToken();
        if (!token) return null;

        const SOCKET_URL = "http://192.168.33.16:8080";

        // Connect with token for server-side authentication
        this.socket = io(SOCKET_URL, {
            auth: { token }
        });

        this.socket.on("connect", () => {
            console.log("Socket connected:", this.socket.id);
        });

        this.socket.on("disconnect", () => {
            console.log("Socket disconnected: ", this.socket.id);
        });

        return this.socket;
    }

    static joinRoom(chatId) {
        if (!this.socket) return;
        this.socket.emit("join-room", chatId);
    }

    static leaveRoom(chatId) {
        if (!this.socket) return;
        this.socket.emit("leave-room", chatId);
    }

    static disconnect() {
        if (!this.socket) return;
        this.socket.disconnect();
        this.socket = null;
    }

    static on(event, callback) {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    static off(event, callback) {
        if (!this.socket) return;
        this.socket.off(event, callback);
    }

    static emit(event, payload) {
        if (!this.socket) return;
        this.socket.emit(event, payload);
    }

    static hook(setUser) {
        function handleMessage(msg) {
            console.log(msg)
            setUser(prev => ({
                ...prev,
                friends: prev.friends.map(f =>
                    f.friendId === msg.senderId
                        ? { ...f, unreadCount: (f.unreadCount || 0) + 1, lastMessageId: msg.id, lastMessage: msg.message, lastMessageTime: msg.dateTimeSent, lastMessageSenderId: msg.senderId, lastMessageHidden: false, lastMessageDiscarded: false }
                        : f
                )
            }));
        };

        function handleMessageUpdate(msg) {
            setUser(prev => ({
                ...prev,
                friends: prev.friends.map(f => {
                    if (f.friendId !== msg.senderId) return f;
                    if (msg.messageId !== f.lastMessageId) return f;

                    switch (msg.context) {
                        case "hide":
                            return { ...f, lastMessageHidden: true };
                        case "unhide":
                            return { ...f, lastMessageHidden: false };
                        case "discard":
                            return { ...f, lastMessageDiscarded: true };
                        case "restore":
                            return { ...f, lastMessageDiscarded: false };
                        default:
                            return f;
                    }
                })
            }));
        }

        function handleNotification(notification) {
            setUser(prev => ({
                ...prev,
                notifications: [
                    notification,
                    ...prev.notifications
                ]
            }));
        }

        function handleNewFriendRequest(request) {
            setUser(prev => ({
                ...prev,
                pendingFriends: [
                    request,
                    ...prev.pendingFriends
                ]
            }));
        }

        function handleNewFriendResponse(payload) {
            if (payload.status === 'accepted') {
                const friendSummary = payload.friendSummary;
                setUser(prev => ({
                    ...prev,
                    friends: [
                        ...prev.friends,
                        friendSummary
                    ]
                }));
            } else {
                const friendId = payload.friendId;
                setUser(prev => ({
                    ...prev,
                    pendingFriends: prev.pendingFriends.map(friend =>
                        friend.id === friendId
                            ? { ...friend, status: 'declined' }
                            : friend
                    )
                }));
            }
        }

        function handleNewFriendStatus(payload) {
            const friendId = payload.friendId;
            const newStatus = payload.status;
            setUser(prev => ({
                ...prev,
                friends: prev.friends.map(friend =>
                    friend.friendId === friendId
                        ? { ...friend, status: newStatus }
                        : friend
                )
            }));
        }

        SocketService.on("new-message-notification", handleMessage);
        SocketService.on("updated-message-visibility", handleMessageUpdate);
        SocketService.on("new-notification", handleNotification);
        SocketService.on("new-friend-request", handleNewFriendRequest);
        SocketService.on("new-friend-response", handleNewFriendResponse);
        SocketService.on("new-friend-status", handleNewFriendStatus);

        return () => {
            SocketService.off("new-message-notification", handleMessage)
            SocketService.off("updated-message-visibility", handleMessageUpdate)
            SocketService.off("new-notification", handleNotification)
            SocketService.off("new-friend-request", handleNewFriendRequest)
            SocketService.off("new-friend-response", handleNewFriendResponse)
            SocketService.off("new-friend-status", handleNewFriendStatus)
        };

    }
}
