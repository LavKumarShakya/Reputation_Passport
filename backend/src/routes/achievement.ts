import { Router, Request, Response } from 'express';
import Achievement from '../models/Achievement';
import User from '../models/User';

const router = Router();

// GET /api/achievements/:userId — Get all achievements for a user
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        
        // Find by MongoDB ID or handle (if we want to support public sharing)
        let user = null;
        if (/^[0-9a-fA-F]{24}$/.test(userId)) {
            user = await User.findById(userId);
        }
        
        if (!user) {
            user = await User.findOne({ handle: userId });
        }
        
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // --- AUTO-GRANT GENESIS NODE (Backfill) ---
        const hasGenesis = await Achievement.findOne({ userId: user._id, type: 'genesis_node' });
        if (!hasGenesis) {
            await Achievement.create({
                userId: user._id,
                title: 'Genesis Node',
                description: 'Successfully initialized a Reputation Passport with GitHub OAuth.',
                icon: '🚀',
                rarity: 'common',
                type: 'genesis_node',
                earnedAt: user.createdAt
            });
        }

        const achievements = await Achievement.find({ userId: user._id }).sort({ earnedAt: -1 });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

export default router;
