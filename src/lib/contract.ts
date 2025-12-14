/**
 * @file contract.ts
 * @notice Smart contract interaction utilities
 * 
 * ARCHITECTURE:
 * - Uses ethers.js for blockchain interactions
 * - Contract address should be set after deployment
 * - Supports wallet connection via wagmi/ethers
 * 
 * PRODUCTION:
 * - Add error handling and retry logic
 * - Implement transaction status polling
 * - Add gas estimation and optimization
 */

import { Contract, ethers, Provider } from 'ethers';

// Contract ABI - Update after compilation
export const REPUTATION_PASSPORT_ABI = [
  "function addIssuer(address issuer)",
  "function addCredential(address user, bytes32 hash, string calldata category)",
  "function getCredentials(address user) view returns (bytes32[])",
  "function getCredential(bytes32 hash) view returns (tuple(bytes32 hash, address issuer, uint256 timestamp, string category))",
  "function credentialExists(bytes32 hash) view returns (bool)",
  "function getCredentialCount(address user) view returns (uint256)",
  "function issuers(address) view returns (bool)",
  "event CredentialAdded(address indexed user, address indexed issuer, bytes32 indexed hash, string category, uint256 timestamp)",
  "event IssuerAdded(address indexed issuer, address indexed addedBy)"
] as const;

// TODO: Update with deployed contract address
// Get this from deployment output or environment variable
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

// Supported networks
export const SUPPORTED_NETWORKS = {
  amoy: {
    chainId: 80002,
    name: 'Polygon Amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology'
  },
  sepolia: {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
  }
} as const;

/**
 * @notice Get contract instance
 * @dev Returns contract connected to provider or signer
 * @param signer Optional signer for write operations
 * @returns Contract instance or null if not initialized
 */
export async function getContract(signer?: ethers.Signer): Promise<Contract | null> {
  if (!CONTRACT_ADDRESS) {
    console.warn('Contract address not set. Please update CONTRACT_ADDRESS in contract.ts');
    return null;
  }
  
  try {
    let provider: Provider | ethers.Signer;
    
    if (signer) {
      provider = signer;
    } else {
      // Use default provider (read-only)
      provider = new ethers.JsonRpcProvider(
        SUPPORTED_NETWORKS.amoy.rpcUrl
      );
    }
    
    return new ethers.Contract(
      CONTRACT_ADDRESS,
      REPUTATION_PASSPORT_ABI,
      provider
    );
  } catch (error) {
    console.error('Error initializing contract:', error);
    return null;
  }
}

/**
 * @notice Add a credential to the blockchain
 * @dev Requires issuer wallet to be connected and whitelisted
 * @param signer Signer from connected wallet (must be whitelisted issuer)
 * @param userWallet Address of the user receiving the credential
 * @param hash SHA-256 hash of the credential data
 * @param category Category of the credential
 * @returns Transaction receipt
 */
export async function addCredential(
  signer: ethers.Signer,
  userWallet: string,
  hash: string,
  category: string
): Promise<ethers.ContractTransactionReceipt | null> {
  try {
    const contract = await getContract(signer);
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    
    // Check if signer is whitelisted issuer
    const isIssuer = await contract.issuers(await signer.getAddress());
    if (!isIssuer) {
      throw new Error('Wallet is not a whitelisted issuer');
    }
    
    // Submit transaction
    const tx = await contract.addCredential(userWallet, hash, category);
    console.log('Transaction submitted:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    return receipt;
  } catch (error) {
    console.error('Error adding credential:', error);
    throw error;
  }
}

/**
 * @notice Get all credentials for a user
 * @param userWallet Address of the user
 * @returns Array of credential hashes
 */
export async function getUserCredentials(userWallet: string): Promise<string[]> {
  try {
    const contract = await getContract();
    if (!contract) {
      return [];
    }
    
    const hashes = await contract.getCredentials(userWallet);
    return hashes.map((hash: string) => hash);
  } catch (error) {
    console.error('Error fetching user credentials:', error);
    return [];
  }
}

/**
 * @notice Check if wallet is connected to supported network
 * @param provider Provider from wallet
 * @returns true if network is supported
 */
export async function isSupportedNetwork(provider: Provider): Promise<boolean> {
  try {
    const network = await provider.getNetwork();
    const supportedChainIds = Object.values(SUPPORTED_NETWORKS).map(n => BigInt(n.chainId));
    return supportedChainIds.includes(network.chainId);
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

