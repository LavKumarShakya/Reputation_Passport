/**
 * @file hashCredential.ts
 * @notice Client-side utility for hashing credential data
 * 
 * ARCHITECTURE:
 * - Credential data is converted to canonical JSON (sorted keys, no whitespace)
 * - SHA-256 hash is computed from the JSON string
 * - Only the hash is stored on-chain, not the raw data
 * 
 * PRODUCTION PATH:
 * - This same hashing logic can be used server-side
 * - Off-chain storage can move to IPFS/Arweave
 * - Smart contract remains the verification source of truth
 */

/**
 * @notice Convert an object to canonical JSON string
 * @dev Keys are sorted alphabetically, no whitespace
 * @param data Object to convert
 * @returns Canonical JSON string
 */
function toCanonicalJSON(data: Record<string, any>): string {
  // Sort keys recursively for consistent hashing
  const sorted = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sorted);
    }
    
    const sortedObj: Record<string, any> = {};
    Object.keys(obj)
      .sort()
      .forEach(key => {
        sortedObj[key] = sorted(obj[key]);
      });
    
    return sortedObj;
  };
  
  const sortedData = sorted(data);
  return JSON.stringify(sortedData);
}

/**
 * @notice Hash credential data using SHA-256
 * @dev This produces a bytes32-compatible hash for on-chain storage
 * @param data Credential data object
 * @returns Hex string of the SHA-256 hash (0x prefixed)
 */
export async function hashCredential(data: Record<string, any>): Promise<string> {
  // Convert to canonical JSON
  const canonicalJSON = toCanonicalJSON(data);
  
  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(canonicalJSON);
  
  // Compute SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
  
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  
  return '0x' + hashHex;
}

/**
 * @notice Synchronous version using Web Crypto API (if available)
 * @dev Falls back to async version if sync API not available
 * @param data Credential data object
 * @returns Hex string of the SHA-256 hash
 */
export function hashCredentialSync(data: Record<string, any>): string {
  // Note: Browser Web Crypto API is async-only
  // For Node.js, you could use crypto.createHash('sha256')
  // This is a placeholder - use hashCredential() for actual implementation
  throw new Error('Use hashCredential() for async hashing');
}

