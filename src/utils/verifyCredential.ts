/**
 * @file verifyCredential.ts
 * @notice Client-side credential verification utility
 * 
 * VERIFICATION FLOW:
 * 1. Load credential data from JSON (off-chain)
 * 2. Recompute hash client-side using hashCredential()
 * 3. Fetch on-chain hash from smart contract
 * 4. Compare hashes - match = VERIFIED, mismatch = INVALID
 * 
 * SECURITY:
 * - Hash comparison is done client-side for prototype
 * - Production: Verification can be done server-side for additional security
 * - Blockchain remains the source of truth
 */

import { hashCredential } from './hashCredential';
import { getContract } from '@/lib/contract';

/**
 * @notice Verify a credential against on-chain hash
 * @param userWallet Address of the credential owner
 * @param credentialData Credential data object (from JSON)
 * @returns Promise<boolean> - true if verified, false if invalid
 */
export async function verifyCredential(
  userWallet: string,
  credentialData: Record<string, any>
): Promise<boolean> {
  try {
    // Step 1: Compute hash from credential data
    const computedHash = await hashCredential(credentialData);
    
    // Step 2: Get contract instance
    const contract = await getContract();
    if (!contract) {
      console.error('Contract not initialized');
      return false;
    }
    
    // Step 3: Check if hash exists on-chain
    const exists = await contract.credentialExists(computedHash);
    
    if (!exists) {
      return false;
    }
    
    // Step 4: Get credential details from chain
    const credential = await contract.getCredential(computedHash);
    
    // Step 5: Verify issuer and user match
    const issuerMatches = credential.issuer.toLowerCase() === credentialData.issuerWallet?.toLowerCase();
    const userMatches = userWallet.toLowerCase() === credentialData.userWallet?.toLowerCase();
    
    return issuerMatches && userMatches;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}

/**
 * @notice Verify multiple credentials for a user
 * @param userWallet Address of the user
 * @param credentials Array of credential data objects
 * @returns Promise<Array<{credential: any, verified: boolean}>>
 */
export async function verifyCredentials(
  userWallet: string,
  credentials: Array<Record<string, any>>
): Promise<Array<{ credential: Record<string, any>; verified: boolean }>> {
  const results = await Promise.all(
    credentials.map(async (credential) => {
      const verified = await verifyCredential(userWallet, credential);
      return { credential, verified };
    })
  );
  
  return results;
}

/**
 * @notice Get verification status for a credential hash
 * @param hash Credential hash to check
 * @returns Promise<boolean> - true if hash exists on-chain
 */
export async function credentialHashExists(hash: string): Promise<boolean> {
  try {
    const contract = await getContract();
    if (!contract) {
      return false;
    }
    
    return await contract.credentialExists(hash);
  } catch (error) {
    console.error('Error checking credential hash:', error);
    return false;
  }
}

