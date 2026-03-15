import { Router, Request, Response } from 'express';
import User from '../models/User';
import Credential from '../models/Credential';
import Achievement from '../models/Achievement';
import axios from 'axios';
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

        // --- AUTO-GRANT GENESIS NODE ---
        // If current user doesn't have it, give it to them now (backfill)
        const hasGenesis = await Achievement.findOne({ userId: user._id, type: 'genesis_node' });
        if (!hasGenesis) {
            await Achievement.create({
                userId: user._id,
                title: 'Genesis Node',
                description: 'Successfully initialized a Reputation Passport with GitHub OAuth.',
                icon: '🚀',
                rarity: 'common',
                type: 'genesis_node',
                earnedAt: user.createdAt // Use join date as earned date
            });
        }

        // --- AUTO-GENERATE TECH STACK (Backfill) ---
        if (!user.techStack || (user.techStack as any).size === 0) {
            const githubProvider = user.connectedProviders?.github;
            const username = githubProvider?.username;
            const token = githubProvider?.accessToken;

            if (username) {
                try {
                    const headers: any = { 'Accept': 'application/vnd.github.v3+json' };
                    if (token) headers.Authorization = `Bearer ${token}`;

                    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
                    const repos = reposResponse.data;
                    const newTechStack: Record<string, number> = {};
                    const popularFrameworks = ['react', 'node', 'nextjs', 'vue', 'angular', 'express', 'tailwind', 'bootstrap', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'aws', 'firebase', 'flutter', 'react-native', 'ethers', 'web3', 'solidity', 'hardhat', 'truffle', 'typescript', 'javascript'];
                    
                    for (const repo of repos) {
                        if (repo.language) newTechStack[repo.language] = (newTechStack[repo.language] || 0) + 50;
                        if (repo.topics && Array.isArray(repo.topics)) {
                            repo.topics.forEach((topic: string) => {
                                const lowerTopic = topic.toLowerCase();
                                if (popularFrameworks.includes(lowerTopic)) {
                                    newTechStack[lowerTopic] = (newTechStack[lowerTopic] || 0) + 70;
                                } else {
                                    newTechStack[lowerTopic] = (newTechStack[lowerTopic] || 0) + 10;
                                }
                            });
                        }
                        if (token && repos.indexOf(repo) < 5 && (repo.language === 'TypeScript' || repo.language === 'JavaScript')) {
                            try {
                                const pkgResponse = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/contents/package.json`, {
                                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3.raw' }
                                });
                                const pkg = typeof pkgResponse.data === 'string' ? JSON.parse(pkgResponse.data) : pkgResponse.data;
                                const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
                                Object.keys(deps).forEach(dep => {
                                    const cleanDep = dep.replace(/^@/, '').split('/')[0].toLowerCase();
                                    if (popularFrameworks.includes(cleanDep)) {
                                        newTechStack[cleanDep] = (newTechStack[cleanDep] || 0) + 100;
                                    }
                                });
                            } catch (err) {}
                        }
                    }
                    
                    await User.findByIdAndUpdate(user._id, { $set: { techStack: newTechStack } });
                    user.techStack = newTechStack;
                } catch (err: any) {
                    console.error('[PROFILE] Failed backfill techStack:', err.message);
                }
            }
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

// PATCH /api/profile — Update authenticated user's profile
router.patch('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { displayName, email, handle } = req.body;
        const updates: any = {};
        
        if (displayName) updates.displayName = displayName;
        if (email) updates.email = email;
        if (handle) {
            // Check if handle is taken by someone else
            const existing = await User.findOne({ handle, _id: { $ne: req.userId } });
            if (existing) {
                res.status(400).json({ error: 'Handle already taken' });
                return;
            }
            updates.handle = handle;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            { new: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('[PROFILE] Update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// DELETE /api/profile — Irreversibly delete authenticated user's account and all data
router.delete('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        // 1. Delete associated data
        await Credential.deleteMany({ userId });
        await Achievement.deleteMany({ userId });

        // 2. Delete the user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        console.log(`[PROFILE] User purged: ${deletedUser.handle} (${userId})`);
        res.json({ message: 'Account purged successfully' });
    } catch (error) {
        console.error('[PROFILE] Purge error:', error);
        res.status(500).json({ error: 'Failed to purge account' });
    }
});

export default router;
