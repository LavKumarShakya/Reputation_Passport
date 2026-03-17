import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; tokenVersion?: number };
        
        // Token version check: if tokenVersion is present in the JWT, verify it matches the DB.
        // This is what enables "logout from all devices" — bumping tokenVersion invalidates old JWTs.
        if (decoded.tokenVersion !== undefined) {
            const user = await User.findById(decoded.userId).select('tokenVersion').lean();
            // Treat a missing tokenVersion in the DB as 0 (for users created before this field was added)
            const dbVersion = (user as any)?.tokenVersion ?? 0;
            if (!user || dbVersion !== decoded.tokenVersion) {
                return res.status(401).json({ error: 'Session terminated. Please log in again.' });
            }
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};
