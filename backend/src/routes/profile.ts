import express, { Router, Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import Credential from '../models/Credential';
import UserSubmission from '../models/UserSubmission';
import Achievement from '../models/Achievement';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middleware/auth';
import { hashCredentialData } from '../services/hashing';
import { addCredentialOnChain } from '../services/blockchain';
import crypto from 'crypto';

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
        const verifiedSubmissions = await UserSubmission.find({ userId: user._id, status: 'verified' });

        const mappedCredentials = credentials.map(c => ({
            id: c._id,
            category: c.category,
            data: c.data,
            hash: c.hash,
            verified: c.verified,
            txHash: c.txHash,
            issuedAt: c.issuedAt,
        }));

        const mappedSubmissions = verifiedSubmissions.map(s => ({
            id: s._id,
            category: s.type,
            data: {
                name: s.title,
                issuerName: s.issuer,
                verifiableLink: s.verificationUrl,
            },
            hash: s.ipfsHash || '',
            verified: true,
            txHash: s.metadata?.txHash || '',
            issuedAt: s.createdAt,
        }));

        res.json({
            user,
            credentials: [...mappedCredentials, ...mappedSubmissions],
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
        const verifiedSubmissions = await UserSubmission.find({ userId: user._id, status: 'verified' });

        const mappedCredentials = credentials.map(c => ({
            id: c._id,
            category: c.category,
            data: c.data,
            hash: c.hash,
            verified: c.verified,
            txHash: c.txHash,
            issuedAt: c.issuedAt,
        }));

        const mappedSubmissions = verifiedSubmissions.map(s => ({
            id: s._id,
            category: s.type,
            data: {
                name: s.title,
                issuerName: s.issuer,
                verifiableLink: s.verificationUrl,
            },
            hash: s.ipfsHash || '',
            verified: true,
            txHash: s.metadata?.txHash || '',
            issuedAt: s.createdAt,
        }));

        res.json({
            user,
            credentials: [...mappedCredentials, ...mappedSubmissions],
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
        
        if (req.body.password) {
            updates.password = await bcrypt.hash(req.body.password, 12);
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

// POST /api/profile/onboard — Complete onboarding and record credentials
router.post('/onboard', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { displayName, handle, email, walletAddress, avatar, visibility, certificates } = req.body;

        // 1. Find user
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // 2. Validate handle is unique if it's changing
        if (handle && handle !== user.handle) {
            const existing = await User.findOne({ handle });
            if (existing) {
                res.status(400).json({ error: 'Handle already taken' });
                return;
            }
        }

        // 3. Resolve wallet address
        let resolvedWallet = walletAddress || user.walletAddress;
        if (!resolvedWallet) {
            // Generate a deterministic mock wallet address based on handle or email
            const seed = email || handle || user.email || user.handle;
            resolvedWallet = '0x' + crypto.createHash('sha256').update(seed).digest('hex').substring(0, 40);
        }

        // 4. Update user details
        user.displayName = displayName || user.displayName;
        user.handle = handle || user.handle;
        user.email = email || user.email;
        user.walletAddress = resolvedWallet;
        if (avatar) {
            user.avatar = avatar;
        }
        if (visibility) {
            user.visibility = {
                certificates: visibility.certificates !== undefined ? visibility.certificates : user.visibility.certificates,
                repos: visibility.repos !== undefined ? visibility.repos : user.visibility.repos,
                endorsements: visibility.endorsements !== undefined ? visibility.endorsements : user.visibility.endorsements,
            };
        }
        user.verified = true; // Mark user as onboarded / verified

        await user.save();

        // 5. Process Certificates / Credentials
        const processedCredentials = [];
        if (certificates && Array.isArray(certificates)) {
            for (const cert of certificates) {
                const { name, certificateId, issuerName, verifiableLink, recipientProfileLink, fileName, fileSize, fileType, fileData } = cert;

                if (!name || !issuerName) {
                    continue; // Name and issuer are required
                }

                // Derive issuer wallet address from issuerName deterministically
                const derivedIssuerWallet = '0x' + crypto.createHash('sha256').update(issuerName).digest('hex').substring(0, 40);

                // Construct raw credential payload
                const credentialData = {
                    name,
                    certificateId: certificateId || 'N/A',
                    issuerName,
                    verifiableLink: verifiableLink || 'N/A',
                    recipientProfileLink: recipientProfileLink || 'N/A',
                    fileName: fileName || '',
                    fileSize: fileSize || 0,
                    fileType: fileType || '',
                    fileData: fileData || '',
                };

                // Hash the credential data
                const hash = hashCredentialData(credentialData);

                // Check for duplicate
                let existingCred = await Credential.findOne({ hash });
                if (existingCred) {
                    processedCredentials.push(existingCred);
                    continue;
                }

                // Write hash on-chain (Polygon)
                let txHash: string | undefined;
                try {
                    // Category: "Certificate"
                    const result = await addCredentialOnChain(resolvedWallet, hash, 'Certificate');
                    txHash = result ?? undefined;
                } catch (chainError) {
                    console.error('[ONBOARDING] On-chain write failed for cert:', name, chainError);
                    // Continue, it will save as unverified on-chain but saved in DB
                }

                // Save to database
                const credential = await Credential.create({
                    userWallet: resolvedWallet,
                    issuerWallet: derivedIssuerWallet,
                    category: 'Certificate',
                    data: credentialData,
                    hash,
                    txHash,
                    verified: !!txHash,
                    issuedAt: new Date(),
                });

                processedCredentials.push(credential);
            }
        }

        res.status(200).json({
            user: {
                id: user._id,
                displayName: user.displayName,
                handle: user.handle,
                email: user.email,
                walletAddress: user.walletAddress,
                avatar: user.avatar,
                reputationScore: user.reputationScore,
                tier: user.tier,
                connectedProviders: user.connectedProviders,
                techStack: user.techStack,
                visibility: user.visibility,
                verified: user.verified,
                createdAt: user.createdAt
            },
            credentials: processedCredentials,
        });

    } catch (error) {
        console.error('[ONBOARDING] Onboarding completion error:', error);
        res.status(500).json({ error: 'Failed to complete onboarding' });
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
