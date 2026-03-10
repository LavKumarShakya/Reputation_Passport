import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import axios from 'axios';
import User from '../models/User';

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
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`;

    // We can pass the current user's token or a session ID in the 'state' if needed
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user`;
    res.redirect(githubUrl);
});

// GET /api/auth/github/callback — Handle GitHub redirect
router.get('/github/callback', async (req: Request, res: Response) => {
    try {
        const { code } = req.query;
        if (!code) {
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding?error=no_code`);
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
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding?error=auth_failed`);
            return;
        }

        // Get GitHub user profile
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const { id, login, avatar_url } = userResponse.data;

        // In a real app, we would link this to the LOGGED IN user.
        // For this demo/onboarding flow, we might redirect back with the info 
        // or create/update a user if we have a way to track them.

        // Redirect back to frontend onboarding with the github info
        // The frontend can then update its local state
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding?github_id=${id}&github_user=${login}&github_token=${accessToken}`);
    } catch (error) {
        console.error('GitHub OAuth Error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding?error=server_error`);
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
