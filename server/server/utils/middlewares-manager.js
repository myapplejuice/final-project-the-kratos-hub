import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

export default class MiddlewaresManager {
    static SECRET_KEY = process.env.SECRET_KEY;

    static asyncHandler(fn) {
        return function (req, res, next) {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

        static tokenAuthorization(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized! No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, MiddlewaresManager.SECRET_KEY);
            
            req.id = decoded.id;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
    }

    static userAuthorization(req, res, next) {
        const tokenId = req.id;
        const callId = req.params.id;

        if (!tokenId || tokenId !== callId) {
            return res.status(403).json({ message: 'Forbidden! Invalid user ID.' });
        }

        next();
    }

    static socketAuthorization(socket, next) {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }

        try {
            const decoded = jwt.verify(token, MiddlewaresManager.SECRET_KEY);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    }

    static adminAuthorization(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized! No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, MiddlewaresManager.SECRET_KEY);

            if (decoded.id !== req.params.id) {
                return res.status(403).json({ message: 'Forbidden! Invalid admin ID.' });
            }

            if (decoded.isActive === false) {
                return res.status(403).json({ message: 'Admin account deactivated!' });
            }

            req.permissions = decoded.permissions;
            req.id = decoded.id;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
    }
}