import jwt from 'jsonwebtoken';

export default class MiddlewaresManager {
    static SECRET_KEY = process.env.SECRET_KEY;

    static asyncHandler(fn) {
        return function (req, res, next) {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    static userAuthorization(req, res, next) {
        const tokenId = req.id;
        const callId = req.params.id;
        
        if (!tokenId || tokenId !== callId) {
            return res.status(403).json({ message: 'Forbidden! Invalid user ID.' });
        }
        
        next();
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

    static adminAuthorization(req, res, next) {
        //DO ADMIN
    }
}