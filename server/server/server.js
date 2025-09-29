import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import Database from './models/database/database.js';
import ServerRouter from './routes/server-router.js';
import EmailService from './models/email/email-service.js';

export default class Server {
    static instance;

    constructor(port = process.env.SERVER_PORT) {
        if (Server.instance) {
            return Server.instance;
        }

        this.port = port;
        this.server = express();
        Server.instance = this;
    }

    async init() {
        try {
            // database & email service initialization
            const database = await Database.init();
            const email = EmailService.init();
            const routes = ServerRouter.init();

            // enabling json and urlencoded body parsing 
            this.server.use(express.json({ limit: '20mb' }));
            this.server.use(express.urlencoded({ limit: '20mb', extended: true }));

            // middlewares
            this.server.use(cors());
            this.server.use(morgan('dev'));

            // routers
            this.server.use('/api', routes);

            return { ...email, ...database };
        } catch (error) {
            console.error('Failed to start server: ', error);
            throw new Error(`Failed to start server: ${error}`);
        }
    }

    start(info) {
        const startup = this.server.listen(this.port, () => {
            console.log(`
                -- SERVER --
                Server running on: http://localhost:${this.port ?? "unknown"}
                
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