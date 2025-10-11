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
            console.log("Socket disconnected");
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

    static on(event, callback) {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    static emit(event, payload) {
        if (!this.socket) return;
        this.socket.emit(event, payload);
    }

    static disconnect() {
        if (!this.socket) return;
        this.socket.disconnect();
        this.socket = null;
    }
}
