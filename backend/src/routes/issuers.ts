import { Router, Request, Response } from 'express';
import Issuer from '../models/Issuer';

const router = Router();

// GET /api/issuers
router.get('/', async (req: Request, res: Response) => {
    try {
        const issuers = await Issuer.find({ verified: true });
        res.json({ issuers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch issuers' });
    }
});

export default router;
