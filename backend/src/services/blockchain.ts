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
];

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

export function getContract() {
    const address = process.env.CONTRACT_ADDRESS;
    if (!address) throw new Error('CONTRACT_ADDRESS not set in .env');
    return new ethers.Contract(address, CONTRACT_ABI, wallet);
}

// Write a credential hash on-chain
export async function addCredentialOnChain(
    userWallet: string,
    hash: string,
    category: string
): Promise<string> {
    const contract = getContract();
    const tx = await contract.addCredential(userWallet, hash, category);
    const receipt = await tx.wait();
    return receipt.hash;  // transaction hash
}

// Check if a credential exists on-chain
export async function verifyCredentialOnChain(hash: string): Promise<boolean> {
    const contract = getContract();
    return await contract.credentialExists(hash);
}

// Get all credential hashes for a user
export async function getUserCredentialsOnChain(userWallet: string): Promise<string[]> {
    const contract = getContract();
    return await contract.getCredentials(userWallet);
}
