import { Router, Request, Response } from 'express';
import Credential from '../models/Credential';
import Issuer from '../models/Issuer';
import { authenticate, AuthRequest } from '../middleware/auth';
import { hashCredentialData } from '../services/hashing';
import { addCredentialOnChain, verifyCredentialOnChain } from '../services/blockchain';

const router = Router();

// POST /api/credentials/issue — Issue a new credential
router.post('/issue', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { userWallet, issuerWallet, category, data } = req.body;

        // Verify issuer exists and is verified
        const issuer = await Issuer.findOne({ walletAddress: issuerWallet, verified: true });
        if (!issuer) {
            res.status(403).json({ error: 'Issuer not verified' });
            return;
        }

        // Hash the credential data
        const hash = hashCredentialData(data);

        // Check for duplicate
        const existing = await Credential.findOne({ hash });
        if (existing) {
            res.status(409).json({ error: 'Credential already exists' });
            return;
        }

        // Write hash on-chain
        let txHash: string | undefined;
        try {
            txHash = await addCredentialOnChain(userWallet, hash, category);
        } catch (chainError) {
            console.error('On-chain write failed:', chainError);
            // Continue — save to DB even if on-chain fails (can retry later)
        }

        // Save to database
        const credential = await Credential.create({
            userWallet,
            issuerWallet,
            category,
            data,
            hash,
            txHash,
            verified: !!txHash,
            issuedAt: new Date(),
        });

        res.status(201).json({ credential, txHash });
    } catch (error) {
        res.status(500).json({ error: 'Failed to issue credential' });
    }
});

// GET /api/credentials/verify/:hash — Verify a credential
router.get('/verify/:hash', async (req: Request, res: Response) => {
    try {
        const hash = req.params.hash as string;

        // Check database
        const credential = await Credential.findOne({ hash });
        if (!credential) {
            res.status(404).json({ verified: false, error: 'Credential not found' });
            return;
        }

        // Check on-chain
        let onChainVerified = false;
        try {
            onChainVerified = await verifyCredentialOnChain(hash);
        } catch (err) {
            console.error('On-chain verification failed:', err);
        }

        res.json({
            verified: onChainVerified,
            credential: {
                category: credential.category,
                issuerWallet: credential.issuerWallet,
                issuedAt: credential.issuedAt,
                txHash: credential.txHash,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// GET /api/credentials/user/:wallet — List all credentials for a user
router.get('/user/:wallet', async (req: Request, res: Response) => {
    try {
        const credentials = await Credential.find({ userWallet: req.params.wallet }).sort({ issuedAt: -1 });
        res.json({ credentials });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch credentials' });
    }
});

// GET /api/credentials/issuer/:wallet — List all credentials issued by an issuer
router.get('/issuer/:wallet', async (req: Request, res: Response) => {
    try {
        const credentials = await Credential.find({ issuerWallet: req.params.wallet }).sort({ issuedAt: -1 });
        res.json({ credentials });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch issued credentials' });
    }
});

export default router;
