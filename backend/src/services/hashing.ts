import crypto from 'crypto';

/**
 * Hash credential data using SHA-256.
 * This hash is what gets stored on-chain.
 * The raw data stays in MongoDB.
 */
export function hashCredentialData(data: Record<string, any>): string {
    // Sort keys for deterministic JSON (same data = same hash every time)
    const canonical = JSON.stringify(data, Object.keys(data).sort());
    const hash = crypto.createHash('sha256').update(canonical).digest('hex');
    return '0x' + hash;
}
