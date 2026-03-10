/**
 * @file mockBlockchain.ts
 * @notice Mock blockchain data for demonstration
 * @dev This simulates blockchain responses for prototype/demo purposes
 */

// Mock contract address
export const MOCK_CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

// Mock credential hashes (simulating on-chain storage)
export const MOCK_CREDENTIAL_HASHES: Record<string, string[]> = {
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb': [
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  ],
  '0x8ba1f109551bD432803012645Hac136c22C3c': [
    '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
  ],
};

// Mock credential details (simulating on-chain credential struct)
export const MOCK_CREDENTIAL_DETAILS: Record<string, {
  hash: string;
  issuer: string;
  timestamp: number;
  category: string;
}> = {
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef': {
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    issuer: '0xISSUER_WALLET_1',
    timestamp: Math.floor(new Date('2025-02-10').getTime() / 1000),
    category: 'Hackathon Win',
  },
  '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890': {
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    issuer: '0xISSUER_WALLET_2',
    timestamp: Math.floor(new Date('2024-12-15').getTime() / 1000),
    category: 'Certificate',
  },
  '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba': {
    hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    issuer: '0xISSUER_WALLET_1',
    timestamp: Math.floor(new Date('2024-11-20').getTime() / 1000),
    category: 'Certificate',
  },
  '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210': {
    hash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    issuer: '0xISSUER_WALLET_3',
    timestamp: Math.floor(new Date('2024-10-01').getTime() / 1000),
    category: 'Achievement',
  },
};

// Mock issuers (whitelisted)
export const MOCK_ISSUERS = [
  '0xISSUER_WALLET_1',
  '0xISSUER_WALLET_2',
  '0xISSUER_WALLET_3',
];

/**
 * @notice Check if we should use mock mode
 * @dev Use mock when contract address is not set or in development
 */
export function shouldUseMock(): boolean {
  return !process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 
         process.env.NODE_ENV === 'development' ||
         typeof window === 'undefined';
}

/**
 * @notice Get mock credential hashes for a user
 */
export function getMockUserCredentials(userWallet: string): string[] {
  return MOCK_CREDENTIAL_HASHES[userWallet] || [];
}

/**
 * @notice Check if mock credential hash exists
 */
export function mockCredentialExists(hash: string): boolean {
  return Object.keys(MOCK_CREDENTIAL_DETAILS).includes(hash);
}

/**
 * @notice Get mock credential details
 */
export function getMockCredential(hash: string) {
  return MOCK_CREDENTIAL_DETAILS[hash] || null;
}

