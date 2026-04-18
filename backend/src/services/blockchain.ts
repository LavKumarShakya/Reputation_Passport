import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Same ABI as frontend's src/lib/contract.ts
const CONTRACT_ABI = [
    "function addIssuer(address issuer)",
    "function addCredential(address user, bytes32 hash, string calldata category)",
    "function getCredentials(address user) view returns (bytes32[])",
    "function getCredential(bytes32 hash) view returns (tuple(bytes32 hash, address issuer, uint256 timestamp, string category))",
    "function credentialExists(bytes32 hash) view returns (bool)",
    "function getCredentialCount(address user) view returns (uint256)",
    "function issuers(address) view returns (bool)",
    "function mintSBT(string memory uri)",
    "function hasMintedSBT(address) view returns (bool)",
    "event CredentialAdded(address indexed user, address indexed issuer, bytes32 indexed hash, string category, uint256 timestamp)",
    "event IssuerAdded(address indexed issuer, address indexed addedBy)",
    "event SBTMinted(address indexed user, uint256 tokenId, string uri)"
];

// Placeholder/invalid key patterns — treat these as "not configured"
const PLACEHOLDER_PATTERNS = ['-', 'disabled', 'none', 'your_wallet_private_key', ''];

function isBlockchainConfigured(): boolean {
    const pk = process.env.PRIVATE_KEY;
    const addr = process.env.CONTRACT_ADDRESS;
    if (!pk || !addr) return false;
    if (PLACEHOLDER_PATTERNS.includes(pk.trim().toLowerCase())) return false;
    if (PLACEHOLDER_PATTERNS.includes(addr.trim().toLowerCase())) return false;
    return true;
}

// Lazy-initialize provider/wallet/contract only if keys are present
function getContract() {
    if (!isBlockchainConfigured()) return null;
    try {
        const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
        return new ethers.Contract(process.env.CONTRACT_ADDRESS as string, CONTRACT_ABI, wallet);
    } catch {
        return null;
    }
}

// Log once on boot so it's clear what mode we're in
if (isBlockchainConfigured()) {
    console.log('⛓️  Blockchain mode: ENABLED');
} else {
    console.warn('⚠️  Blockchain mode: DISABLED (no PRIVATE_KEY or CONTRACT_ADDRESS). Running in database-only mode.');
}

// Write a credential hash on-chain. Returns null if blockchain is not configured.
export async function addCredentialOnChain(
    userWallet: string,
    hash: string,
    category: string
): Promise<string | null> {
    const contract = getContract();
    if (!contract) return null;
    const tx = await contract.addCredential(userWallet, hash, category);
    const receipt = await tx.wait();
    return receipt.hash;
}

// Check if a credential exists on-chain. Returns false if blockchain is not configured.
export async function verifyCredentialOnChain(hash: string): Promise<boolean> {
    const contract = getContract();
    if (!contract) return false;
    return await contract.credentialExists(hash);
}

// Get all credential hashes for a user. Returns [] if blockchain is not configured.
export async function getUserCredentialsOnChain(userWallet: string): Promise<string[]> {
    const contract = getContract();
    if (!contract) return [];
    return await contract.getCredentials(userWallet);
}

export { isBlockchainConfigured };
