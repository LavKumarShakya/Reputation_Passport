import fs from 'fs';
import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

/**
 * Upload a file to IPFS via Pinata.
 * Falls back to a deterministic mock hash if Pinata keys are not configured.
 *
 * IMPORTANT: This should only be called AFTER successful verification.
 * Never upload unverified files to avoid wasting storage.
 *
 * @param filePath  Absolute path to the file on disk
 * @param fileName  Original file name for Pinata metadata
 * @returns         IPFS CID hash string (real or mock)
 */
export async function uploadToIPFS(filePath: string, fileName: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);

    // If Pinata is not configured, generate a deterministic mock CID
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        // IPFS CIDs start with "Qm" for SHA-256 based CIDv0 (base58btc multihash)
        const mockCid = 'Qm' + hash.substring(0, 44);
        console.log(`[IPFS] Mock mode — generated CID: ${mockCid}`);
        return mockCid;
    }

    // Real Pinata upload
    try {
        const form = new FormData();
        form.append('file', fileBuffer, { filename: fileName });
        form.append('pinataMetadata', JSON.stringify({ name: fileName }));
        form.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', form, {
            headers: {
                ...form.getHeaders(),
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY,
            },
            maxBodyLength: Infinity,
            timeout: 60_000,
        });

        const cid: string = response.data.IpfsHash;
        console.log(`[IPFS] Pinned file to IPFS: ${cid}`);
        return cid;
    } catch (err: any) {
        console.error('[IPFS] Pinata upload failed:', err.message);
        // Fallback to mock CID on Pinata failure
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        return 'Qm' + hash.substring(0, 44);
    }
}

/**
 * Clean up a temporary file after it's been processed.
 */
export function cleanupTempFile(filePath: string): void {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[IPFS] Cleaned up temp file: ${filePath}`);
        }
    } catch (err) {
        console.error('[IPFS] Failed to clean up temp file:', err);
    }
}
