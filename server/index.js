import dotenv from 'dotenv';
dotenv.config();
import Server from "./server/server.js";

async function run() {
    try {
        const server = new Server(process.env.PORT || 8080);
        const info = await server.init();
        server.start(info);
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

run();
