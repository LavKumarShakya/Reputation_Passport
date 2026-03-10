import { Router, Request, Response } from 'express';
import User from '../models/User';
import Credential from '../models/Credential';
import Issuer from '../models/Issuer';

const router = Router();

// GET /api/admin/stats
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCredentials = await Credential.countDocuments();
        const verifiedCredentials = await Credential.countDocuments({ verified: true });

        // Mock revenue or calculate based on platform fees if applicable.
        const mockRevenue = totalCredentials * 2.50; // $2.50 per credential issued

        res.json({
            stats: [
                { label: 'Active Users (All Time)', value: totalUsers.toLocaleString(), change: '+12%', icon: 'Users' },
                { label: 'Certificates Issued', value: totalCredentials.toLocaleString(), change: '+8%', icon: 'Award' },
                { label: 'On-Chain Transactions', value: verifiedCredentials.toLocaleString(), change: '+15%', icon: 'Link2' },
                { label: 'Est. Revenue', value: `$${mockRevenue.toLocaleString()}`, change: '+22%', icon: 'DollarSign' }
            ]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// GET /api/admin/institutions
router.get('/institutions', async (req: Request, res: Response) => {
    try {
        const issuers = await Issuer.find({}).lean();

        // Count credentials per issuer
        const enrichedIssuers = await Promise.all(issuers.map(async (issuer) => {
            const totalIssued = await Credential.countDocuments({ issuerWallet: issuer.walletAddress });
            const verifiedIssued = await Credential.countDocuments({ issuerWallet: issuer.walletAddress, verified: true });

            const verificationRate = totalIssued > 0
                ? ((verifiedIssued / totalIssued) * 100).toFixed(1)
                : '0.0';

            return {
                name: issuer.name,
                issued: totalIssued,
                verified: parseFloat(verificationRate),
                status: issuer.verified ? 'Active' : 'Pending'
            };
        }));

        // Sort by most issued
        enrichedIssuers.sort((a, b) => b.issued - a.issued);

        res.json({ institutions: enrichedIssuers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin institutions' });
    }
});

// GET /api/admin/activity
router.get('/activity', async (req: Request, res: Response) => {
    try {
        // Fetch most recent credentials
        const recentCreds = await Credential.find({}).sort({ issuedAt: -1 }).limit(10).lean();

        // We'll format the credentials as activity items
        // In a real app we'd also merge User creation events here, 
        // but for now let's just map the recent certificates
        const activity = await Promise.all(recentCreds.map(async (c) => {
            // Find issuer name 
            const issuer = await Issuer.findOne({ walletAddress: c.issuerWallet });
            const issuerName = issuer?.name || c.issuerWallet.slice(0, 8);

            return {
                action: 'Certificate issued',
                user: issuerName,
                time: new Date(c.issuedAt).toLocaleDateString(), // simplified time
                type: 'cert'
            };
        }));

        res.json({ activity });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin activity' });
    }
});

export default router;
