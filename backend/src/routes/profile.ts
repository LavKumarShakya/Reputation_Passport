import { Router, Request, Response } from 'express';
import User from '../models/User';
import Credential from '../models/Credential';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/profile/me — Authenticated user's own profile (MUST be before /:id)
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const credentials = await Credential.find({ userWallet: user.walletAddress });

        res.json({
            user,
            credentials: credentials.map(c => ({
                id: c._id,
                category: c.category,
                data: c.data,
                hash: c.hash,
                verified: c.verified,
                txHash: c.txHash,
                issuedAt: c.issuedAt,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// GET /api/profile/:id — Public profile (by MongoDB ID or wallet address)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        // Try finding by MongoDB ID first, then by walletAddress, then by handle
        let user = null;
        const param = req.params.id as string;

        // Check if it looks like a MongoDB ObjectId (24 hex chars)
        if (/^[0-9a-fA-F]{24}$/.test(param)) {
            user = await User.findById(param).select('-password -connectedProviders');
        }

        // Try wallet address
        if (!user) {
            user = await User.findOne({ walletAddress: param }).select('-password -connectedProviders');
        }

        // Try handle
        if (!user) {
            user = await User.findOne({ handle: param }).select('-password -connectedProviders');
        }

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const credentials = await Credential.find({ userWallet: user.walletAddress });

        res.json({
            user,
            credentials: credentials.map(c => ({
                id: c._id,
                category: c.category,
                data: c.data,
                hash: c.hash,
                verified: c.verified,
                txHash: c.txHash,
                issuedAt: c.issuedAt,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

export default router;
