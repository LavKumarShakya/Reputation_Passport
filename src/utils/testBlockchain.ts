/**
 * @file testBlockchain.ts
 * @notice Frontend utility to test blockchain integration
 * @dev Import and call these functions from browser console or a test page
 */

import { hashCredential } from './hashCredential';
import { verifyCredential, credentialHashExists } from './verifyCredential';
import { getContract, getUserCredentials, isSupportedNetwork } from '@/lib/contract';
import { ethers } from 'ethers';

/**
 * @notice Test blockchain connection and contract
 * @dev Call from browser console: testBlockchainConnection()
 */
export async function testBlockchainConnection() {
  console.log('🧪 Testing Blockchain Connection\n');

  try {
    // Test 1: Check if contract is initialized
    console.log('Test 1: Checking contract initialization...');
    const contract = await getContract();
    if (!contract) {
      console.error('❌ Contract not initialized. Update CONTRACT_ADDRESS in src/lib/contract.ts');
      return;
    }
    console.log('✅ Contract initialized');
    // Get address from contract target (ethers v6)
    const contractAddress = typeof contract.target === 'string' 
      ? contract.target 
      : await contract.getAddress?.() || 'Unknown';
    console.log('Contract address:', contractAddress);
    console.log('');

    // Test 2: Check network
    console.log('Test 2: Checking network...');
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      console.log('Network:', network.name, 'Chain ID:', network.chainId.toString());
      
      const supported = await isSupportedNetwork(provider);
      console.log(supported ? '✅ Network is supported' : '⚠️ Network not in supported list');
    } else {
      console.log('⚠️ No wallet provider found (using read-only mode)');
    }
    console.log('');

    // Test 3: Test hashing
    console.log('Test 3: Testing credential hashing...');
    const testData = {
      event: "Test Hackathon",
      position: "1st",
      date: "2025-01-01"
    };
    const hash = await hashCredential(testData);
    console.log('Credential data:', testData);
    console.log('Hash:', hash);
    console.log('✅ Hashing works');
    console.log('');

    // Test 4: Check if hash exists on-chain
    console.log('Test 4: Checking if hash exists on-chain...');
    const exists = await credentialHashExists(hash);
    console.log(exists ? '✅ Hash found on-chain' : 'ℹ️ Hash not found (normal for new credentials)');
    console.log('');

    console.log('🎉 Basic tests completed!');
    console.log('\nNext steps:');
    console.log('1. Connect wallet (if not already)');
    console.log('2. Deploy contract or use existing deployment');
    console.log('3. Add issuer using addIssuer()');
    console.log('4. Add credential using addCredential()');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * @notice Test credential verification flow
 * @param userWallet User wallet address
 * @param credentialData Credential data object
 */
export async function testVerification(userWallet: string, credentialData: Record<string, any>) {
  console.log('🔍 Testing Credential Verification\n');
  console.log('User:', userWallet);
  console.log('Credential data:', credentialData);
  console.log('');

  try {
    // Step 1: Hash the credential
    console.log('Step 1: Computing hash...');
    const hash = await hashCredential(credentialData);
    console.log('Hash:', hash);
    console.log('');

    // Step 2: Check if hash exists
    console.log('Step 2: Checking on-chain...');
    const exists = await credentialHashExists(hash);
    console.log(exists ? '✅ Hash exists on-chain' : '❌ Hash NOT found on-chain');
    console.log('');

    // Step 3: Full verification
    console.log('Step 3: Full verification...');
    const verified = await verifyCredential(userWallet, credentialData);
    console.log(verified ? '✅ Credential VERIFIED' : '❌ Credential INVALID');
    console.log('');

    return { hash, exists, verified };
  } catch (error) {
    console.error('❌ Verification test failed:', error);
    throw error;
  }
}

/**
 * @notice Test getting user credentials
 * @param userWallet User wallet address
 */
export async function testGetUserCredentials(userWallet: string) {
  console.log('📋 Testing Get User Credentials\n');
  console.log('User:', userWallet);
  console.log('');

  try {
    const hashes = await getUserCredentials(userWallet);
    console.log(`Found ${hashes.length} credential(s):`);
    hashes.forEach((hash, index) => {
      console.log(`${index + 1}. ${hash}`);
    });
    console.log('');

    return hashes;
  } catch (error) {
    console.error('❌ Failed to get credentials:', error);
    throw error;
  }
}

/**
 * @notice Complete integration test
 * @dev Run this after deploying contract and adding test data
 */
export async function runIntegrationTest() {
  console.log('🚀 Running Complete Integration Test\n');
  console.log('='.repeat(50));
  console.log('');

  // Test connection
  await testBlockchainConnection();
  console.log('');

  // Test with sample data
  const testUser = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const testCredential = {
    userWallet: testUser,
    issuerWallet: '0xISSUER_WALLET_1',
    category: 'Hackathon Win',
    data: {
      event: "GDG Hackathon",
      position: "1st",
      date: "2025-02-10"
    }
  };

  console.log('='.repeat(50));
  await testVerification(testUser, testCredential);
  console.log('');

  console.log('='.repeat(50));
  await testGetUserCredentials(testUser);
  console.log('');

  console.log('✅ Integration test completed!');
}

