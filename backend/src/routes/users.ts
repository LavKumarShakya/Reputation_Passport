import { Router, Request, Response } from 'express';
import User from '../models/User';
import Credential from '../models/Credential';

const router = Router();

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await User.find({ verified: true }).lean();

        // Attach certificate count (mock simple implementation)
        const enrichedUsers = await Promise.all(users.map(async (u) => {
            const credentials = await Credential.countDocuments({ userWallet: u.walletAddress });
            return {
                ...u,
                id: u._id,
                name: u.displayName,
                score: u.reputationScore,
                certificates: credentials,
                skills: ['React', 'Solidity'] // Mocking skills since it's not in the DB yet
            };
        }));

        res.json({ users: enrichedUsers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

export default router;
