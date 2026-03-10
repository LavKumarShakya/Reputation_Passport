import { Router, Request, Response } from 'express';
import Credential from '../models/Credential';

const router = Router();

// GET /api/graph/:wallet — Get graph nodes/edges for a user
router.get('/:wallet', async (req: Request, res: Response) => {
    try {
        const credentials = await Credential.find({ userWallet: req.params.wallet });

        // Build graph nodes from real credentials
        const nodes = credentials.map(c => ({
            id: c._id.toString(),
            label: c.data.event || c.data.course || c.data.achievement || c.category,
            type: c.category.toLowerCase().includes('hackathon') ? 'hackathon'
                : c.category.toLowerCase().includes('certificate') ? 'certificate'
                    : 'project',
            value: c.verified ? 80 : 40,
            color: c.verified ? '#22C55E' : '#6B7280',
        }));

        // Build edges connecting each credential to a central user node
        const edges = nodes.map(n => ({
            source: 'center',
            target: n.id,
            weight: n.value > 60 ? 4 : 2,
        }));

        // Add center node
        nodes.unshift({
            id: 'center',
            label: req.params.wallet.slice(0, 10) + '...',
            type: 'skill' as any,
            value: 100,
            color: '#3B82F6',
        });

        res.json({ nodes, edges });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate graph data' });
    }
});

export default router;
