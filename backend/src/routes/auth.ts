import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import axios from 'axios';
import User from '../models/User';
import Credential from '../models/Credential';
import Achievement from '../models/Achievement';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { displayName, handle, email, password, walletAddress } = req.body;

        // Check if user exists
        const existing = await User.findOne({ $or: [{ email }, { handle }] });
        if (existing) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        // Hash password (if email/password signup)
        let hashedPassword: string | undefined;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 12);
        }

        const user = await User.create({
            displayName,
            handle,
            email,
            password: hashedPassword,
            walletAddress,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`,
        });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
        });

        res.status(201).json({ user: { id: user._id, displayName, handle, email }, token });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
        });

        res.json({ user: { id: user._id, displayName: user.displayName, handle: user.handle }, token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/wallet — Login/register with wallet address
router.post('/wallet', async (req: Request, res: Response) => {
    try {
        const { walletAddress, signature, message } = req.body;

        // Verify the signature to prove wallet ownership
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            res.status(401).json({ error: 'Invalid wallet signature' });
            return;
        }

        // Find or create user
        let user = await User.findOne({ walletAddress });
        if (!user) {
            user = await User.create({
                displayName: `User-${walletAddress.slice(0, 6)}`,
                handle: walletAddress.slice(0, 10),
                email: `${walletAddress.slice(0, 10)}@wallet.local`,
                walletAddress,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress}`,
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: '7d',
        });

        res.json({ user: { id: user._id, walletAddress: user.walletAddress }, token });
    } catch (error) {
        res.status(500).json({ error: 'Wallet auth failed' });
    }
});

// GET /api/auth/github — Redirect to GitHub OAuth
router.get('/github', (req: Request, res: Response) => {
    const githubUrl = new URL('https://github.com/login/oauth/authorize');
    githubUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID || '');
    githubUrl.searchParams.set('redirect_uri', `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`);
    githubUrl.searchParams.set('scope', 'read:user user:email');

    console.log('Redirecting to GitHub:', githubUrl.toString());
    res.redirect(githubUrl.toString());
});

// GET /api/auth/github/callback — Handle GitHub redirect
router.get('/github/callback', async (req: Request, res: Response) => {
    try {
        const { code } = req.query;
        if (!code) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?error=no_code`);
            return;
        }

        // Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        }, {
            headers: { Accept: 'application/json' }
        });

        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?error=auth_failed`);
            return;
        }

        // Get GitHub user profile
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const { id: githubId, login, avatar_url, name, email, followers, public_repos, created_at } = userResponse.data;

        // --- CALCULATION LOGIC ---
        // --- DEEP FRAMEWORK DETECTION ---
        let totalStars = 0;
        const techStack: Record<string, number> = {};
        const popularFrameworks = ['react', 'node', 'nextjs', 'vue', 'angular', 'express', 'tailwind', 'bootstrap', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'aws', 'firebase', 'flutter', 'react-native', 'ethers', 'web3', 'solidity', 'hardhat', 'truffle', 'typescript', 'javascript'];
        
        try {
            const reposResponse = await axios.get(`https://api.github.com/users/${login}/repos?per_page=100&sort=updated`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const repos = reposResponse.data;
            
            for (const repo of repos) {
                totalStars += repo.stargazers_count;
                
                // 1. Languages (GitHub Native)
                if (repo.language) {
                    techStack[repo.language] = (techStack[repo.language] || 0) + 50;
                }
                
                // 2. Topics (User-defined tags)
                if (repo.topics && Array.isArray(repo.topics)) {
                    repo.topics.forEach((topic: string) => {
                        const lowerTopic = topic.toLowerCase();
                        if (popularFrameworks.includes(lowerTopic)) {
                            techStack[lowerTopic] = (techStack[lowerTopic] || 0) + 70; // Higher confidence from topics
                        } else {
                            techStack[lowerTopic] = (techStack[lowerTopic] || 0) + 10;
                        }
                    });
                }
                
                // 3. Manifest Scanning (package.json for JS/TS)
                // Limit to top 5 most recently updated repos to avoid rate limits
                if (repos.indexOf(repo) < 5 && (repo.language === 'TypeScript' || repo.language === 'JavaScript')) {
                    try {
                        const contentsUrl = `https://api.github.com/repos/${login}/${repo.name}/contents/package.json`;
                        const pkgResponse = await axios.get(contentsUrl, {
                            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3.raw' }
                        });
                        const pkg = typeof pkgResponse.data === 'string' ? JSON.parse(pkgResponse.data) : pkgResponse.data;
                        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
                        
                        Object.keys(deps).forEach(dep => {
                            const cleanDep = dep.replace(/^@/, '').split('/')[0].toLowerCase();
                            if (popularFrameworks.includes(cleanDep)) {
                                techStack[cleanDep] = (techStack[cleanDep] || 0) + 100; // 100% confidence from manifest
                            }
                        });
                    } catch (err) {
                        // ignore if package.json doesn't exist
                    }
                }
            }
        } catch (err) {
            console.error('Failed deep tech scan:', err);
        }

        // 2. Calculate Account Age in Years
        const accountAgeMs = Date.now() - new Date(created_at).getTime();
        const accountAgeYears = accountAgeMs / (1000 * 60 * 60 * 24 * 365);

        // 3. Compute Points (Max 1000)
        let score = 0;
        score += Math.min(followers * 5, 200);           // Max 200 from followers
        score += Math.min(public_repos * 10, 200);       // Max 200 from repos
        score += Math.min(totalStars * 20, 400);         // Max 400 from stars
        score += Math.min(accountAgeYears * 20, 200);    // Max 200 from age
        score = Math.floor(score); // Round to whole number

        // 4. Determine Tier
        let calculatedTier = 'bronze';
        if (score > 800) calculatedTier = 'diamond';
        else if (score > 500) calculatedTier = 'gold';
        else if (score > 200) calculatedTier = 'silver';

        // Upsert: find by GitHub ID OR email, then update. If not found, create.
        const searchConditions: any[] = [{ 'connectedProviders.github.id': String(githubId) }];
        if (email) searchConditions.push({ email: email });

        const user = await User.findOneAndUpdate(
            { $or: searchConditions },
            {
                $set: {
                    reputationScore: score,
                    tier: calculatedTier,
                    techStack: techStack,
                    'connectedProviders.github': { id: String(githubId), username: login, accessToken: accessToken },
                },
                $setOnInsert: {
                    displayName: name || login,
                    handle: login,
                    email: email || `${login}@github.local`,
                    avatar: avatar_url,
                    verified: true,
                },
            },
            { upsert: true, new: true, runValidators: false }
        );

        if (!user) throw new Error('User upsert returned null');

        // Update avatar only if the stored one is a placeholder
        if (!user.avatar || user.avatar.includes('api.dicebear.com')) {
            await User.findByIdAndUpdate(user._id, { $set: { avatar: avatar_url } });
            user.avatar = avatar_url;
        }

        // --- GRANT ACHIEVEMENTS ---
        // 1. Genesis Node (granted for connecting GitHub)
        try {
            await Achievement.findOneAndUpdate(
                { userId: user._id, type: 'genesis_node' },
                {
                    $setOnInsert: {
                        userId: user._id,
                        title: 'Genesis Node',
                        description: 'Successfully initialized a Reputation Passport with GitHub OAuth.',
                        icon: '🚀',
                        rarity: 'common',
                        type: 'genesis_node',
                        earnedAt: new Date()
                    }
                },
                { upsert: true }
            );
        } catch (err) { /* ignore duplicate index error */ }

        // 2. High Reputation (granted if score > 500)
        if (score > 500) {
            try {
                await Achievement.findOneAndUpdate(
                    { userId: user._id, type: 'high_rep' },
                    {
                        $setOnInsert: {
                            userId: user._id,
                            title: 'Elite Vector',
                            description: 'Achieved a global reputation score higher than 500.',
                            icon: '🏆',
                            rarity: 'rare',
                            type: 'high_rep',
                            earnedAt: new Date()
                        }
                    },
                    { upsert: true }
                );
            } catch (err) { }
        }

        // Issue JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: '7d',
        });

        // Redirect to frontend with the token — frontend will store it
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&userId=${user._id}&displayName=${encodeURIComponent(user.displayName)}&handle=${user.handle}&avatar=${encodeURIComponent(user.avatar)}`);
    } catch (error: any) {
        console.error('\n\n################################################################');
        console.error('#################### GITHUB OAUTH ERROR ########################');
        console.error('MESSAGE:', error.message);
        console.error('STACK:', error.stack);
        if (error.response) {
            console.error('RESPONSE DATA:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('################################################################\n\n');

        const fs = require('fs');
        const errMsg = `[${new Date().toISOString()}]\nMessage: ${error.message}\nStack: ${error.stack}\nResponseData: ${JSON.stringify(error?.response?.data)}\n\n`;
        fs.appendFileSync('oauth-error.log', errMsg);

        const safeMsg = encodeURIComponent(error.message || 'unknown');
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?error=server_error_v4&msg=${safeMsg}`);
    }
});

// POST /api/auth/mock-wallet — Dev-only: login with just a wallet address (no signature)
router.post('/mock-wallet', async (req: Request, res: Response) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            res.status(403).json({ error: 'Mock login disabled in production' });
            return;
        }

        const { walletAddress } = req.body;
        if (!walletAddress) {
            res.status(400).json({ error: 'walletAddress is required' });
            return;
        }

        // Find user by wallet address
        let user = await User.findOne({ walletAddress });
        if (!user) {
            res.status(404).json({ error: 'No user found with that wallet address' });
            return;
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: '7d',
        });

        res.json({
            user: {
                id: user._id,
                displayName: user.displayName,
                handle: user.handle,
                walletAddress: user.walletAddress,
                avatar: user.avatar,
                reputationScore: user.reputationScore,
                tier: user.tier,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ error: 'Mock wallet auth failed' });
    }
});

export default router;
