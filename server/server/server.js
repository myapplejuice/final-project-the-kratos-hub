import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import Database from './models/database/database.js';
import ServerRouter from './routes/server-router.js';
import EmailService from './models/email/email-service.js';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import MiddlewaresManager from './utils/middlewares-manager.js';
import ChatController from './models/chat/chat-controller.js';
import ChatDBService from './models/chat/chat-db-service.js';

export default class Server {
    static instance;

    constructor(port = process.env.SERVER_PORT) {
        if (Server.instance) {
            return Server.instance;
        }

        this.port = port;
        this.app = express();
        this.initSocketServer();
        Server.instance = this;
    }

    async init() {
        try {
            // database & email service initialization
            const database = await Database.init();
            const email = EmailService.init();
            const routes = ServerRouter.init();

            // enabling json and urlencoded body parsing 
            this.app.use(express.json({ limit: '20mb' }));
            this.app.use(express.urlencoded({ limit: '20mb', extended: true }));

            // middlewares
            this.app.use(cors());
            this.app.use(morgan('dev'));

            // routers
            this.app.use('/api', routes);

            return { ...email, ...database };
        } catch (error) {
            console.error('Failed to start server: ', error);
            throw new Error(`Failed to start server: ${error}`);
        }
    }

    initSocketServer() {
        this.httpServer = createServer(this.app);
        this.io = new SocketIOServer(this.httpServer, {
            cors: { origin: '*' }
        });

        this.io.use(MiddlewaresManager.socketAuthorization);

        this.io.on('connection', (socket) => {
            console.log('Socket connected:', socket.id);
            const userId = socket.userId;
            socket.join(userId);

            socket.on('join-room', (chatId) => {
                socket.join(chatId);
                console.log(`Socket ${socket.id} joined chat ${chatId}`);

            });

            socket.on('leave-room', (chatId) => {
                socket.leave(chatId);
                console.log(`Socket ${socket.id} left chat ${chatId}`);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected:', socket.id);
            });

            socket.on('send-message', async (payload, callback) => {
                const savedMessageId = await ChatController.sendMessage(this.io, payload);
                if (callback) callback(savedMessageId);
            });

            socket.on('mark-seen', async ({ userId, messageIds }) => {
                try {
                    await ChatDBService.markMessagesSeen([userId], messageIds);
                    console.log(`User ${userId} marked messages ${messageIds.join(', ')} as seen`);
                } catch (err) {
                    console.error('Error marking messages as seen:', err);
                }
            });
        });
    }


    start(info) {
        const startup = this.httpServer.listen(this.port, () => {
            console.log(`
                -- SERVER --
                Server running on: http://localhost:${this.port}/
                
                -- DATABASE SERVICE--
                Server: ${info?.server ?? "unknown"}
                Database: ${info?.database ?? "unknown"}
                Trust Certification: ${info?.trustServerCertificate ?? false}
                Trusted Connection: ${info?.trustedConnection ?? false}
                Connection Timeout: ${info?.connectionTimeout ?? "default"}
                Request Timeout: ${info?.requestTimeout ?? "default"}
                
                -- EMAIL SERVICE--
                Host: ${info?.host ?? "unknown"}
                Port: ${info?.port ?? "default"}
                Security: ${info?.secure ? "SMTPS/SSL/TLS" : "STARTTLS/plain"}
                Authentication: ${info?.auth?.user ?? "unknown"}
                `);
        });

        startup.on('error', (err) => {
            console.error('Failed to start server:', err);
            process.exit(1);
        });
    }
}