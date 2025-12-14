/**
 * @file dataLoader.ts
 * @notice Utility for loading mock JSON data (prototype simulation)
 * 
 * ARCHITECTURE:
 * - In production, this would fetch from a backend API
 * - For prototype, data is loaded from /data/*.json files
 * - Data structure matches the schema defined in requirements
 */

export interface User {
  name: string;
  role: string;
  reputationScore: number;
  email?: string;
  github?: string;
  joinedAt?: string;
}

export interface Credential {
  userWallet: string;
  issuerWallet: string;
  category: string;
  data: Record<string, any>;
  issuedAt: string;
}

export interface Issuer {
  name: string;
  verified: boolean;
  type?: string;
  description?: string;
  website?: string;
}

/**
 * @notice Load users data
 * @dev In production, this would be an API call
 */
export async function loadUsers(): Promise<Record<string, User>> {
  try {
    const response = await fetch('/data/users.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading users:', error);
    return {};
  }
}

/**
 * @notice Load credentials data
 * @dev In production, this would be an API call
 */
export async function loadCredentials(): Promise<Credential[]> {
  try {
    const response = await fetch('/data/credentials.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading credentials:', error);
    return [];
  }
}

/**
 * @notice Load issuers data
 * @dev In production, this would be an API call
 */
export async function loadIssuers(): Promise<Record<string, Issuer>> {
  try {
    const response = await fetch('/data/issuers.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading issuers:', error);
    return {};
  }
}

/**
 * @notice Get credentials for a specific user
 */
export async function getUserCredentials(userWallet: string): Promise<Credential[]> {
  const credentials = await loadCredentials();
  return credentials.filter(cred => 
    cred.userWallet.toLowerCase() === userWallet.toLowerCase()
  );
}

