# Blockchain Testing Guide

This guide explains how to verify that the blockchain integration is working correctly.

## Prerequisites

1. **Install dependencies:**
   ```bash
   cd blockchain
   npm install
   ```

2. **Set up environment:**
   Create `blockchain/.env`:
   ```
   PRIVATE_KEY=your_private_key_here
   POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   ```

3. **Get testnet tokens:**
   - Polygon Amoy: https://faucet.polygon.technology/
   - Ethereum Sepolia: https://sepoliafaucet.com/

## Method 1: Hardhat Test Script (Recommended)

This tests the contract directly using Hardhat.

### Local Network (Fastest)

```bash
cd blockchain
npx hardhat run test.js --network hardhat
```

This will:
- Deploy contract locally
- Test all functions
- Verify issuer whitelisting
- Test credential addition
- Verify credential lookup

**Expected Output:**
```
🧪 Testing Reputation Passport Contract
✅ Contract deployed to: 0x...
✅ Owner is issuer
✅ Issuer whitelisted
✅ Credential added
✅ Credential hash found on-chain
🎉 All tests completed!
```

### Testnet (Real Blockchain)

```bash
cd blockchain
npx hardhat run test.js --network amoy
```

**Note:** This uses real testnet tokens and takes longer.

## Method 2: Frontend Testing

Test from the browser console or create a test page.

### Step 1: Deploy Contract

```bash
cd blockchain
npx hardhat run deploy.js --network amoy
```

Copy the deployed address and update `src/lib/contract.ts`:
```typescript
const CONTRACT_ADDRESS = '0x...'; // Your deployed address
```

### Step 2: Test from Browser Console

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open browser console (F12)

3. Import and run tests:
   ```javascript
   // Import test functions
   import { testBlockchainConnection, runIntegrationTest } from './src/utils/testBlockchain';

   // Test basic connection
   await testBlockchainConnection();

   // Run full integration test
   await runIntegrationTest();
   ```

### Step 3: Test Credential Verification

```javascript
import { testVerification } from './src/utils/testBlockchain';

const testData = {
  userWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  issuerWallet: "0xISSUER_WALLET_1",
  category: "Hackathon Win",
  data: {
    event: "GDG Hackathon",
    position: "1st",
    date: "2025-02-10"
  }
};

await testVerification(testData.userWallet, testData);
```

## Method 3: Manual Testing Checklist

### ✅ Contract Deployment
- [ ] Contract compiles without errors
- [ ] Contract deploys successfully
- [ ] Contract address is saved
- [ ] Contract address updated in `src/lib/contract.ts`

### ✅ Issuer Management
- [ ] Owner can add issuers
- [ ] Owner can remove issuers
- [ ] Non-owners cannot add issuers
- [ ] Issuer status can be checked

### ✅ Credential Hashing
- [ ] `hashCredential()` produces consistent hashes
- [ ] Same data produces same hash
- [ ] Different data produces different hash
- [ ] Hash is 66 characters (0x + 64 hex chars)

### ✅ Credential Addition
- [ ] Whitelisted issuer can add credentials
- [ ] Non-issuer cannot add credentials
- [ ] Credential hash is stored on-chain
- [ ] Events are emitted correctly

### ✅ Credential Verification
- [ ] `credentialExists()` returns true for added credentials
- [ ] `credentialExists()` returns false for non-existent hashes
- [ ] `verifyCredential()` returns true for valid credentials
- [ ] `verifyCredential()` returns false for invalid credentials

### ✅ Data Retrieval
- [ ] `getCredentials()` returns user's credential hashes
- [ ] `getCredential()` returns credential details
- [ ] `getCredentialCount()` returns correct count

## Common Issues & Solutions

### Issue: "Contract not initialized"
**Solution:** Update `CONTRACT_ADDRESS` in `src/lib/contract.ts`

### Issue: "Only whitelisted issuers can call this"
**Solution:** Add your wallet as issuer using `addIssuer()` function

### Issue: "Network not supported"
**Solution:** Check `SUPPORTED_NETWORKS` in `src/lib/contract.ts` matches your network

### Issue: "Transaction failed"
**Solution:** 
- Check you have testnet tokens
- Verify network is correct
- Check gas limits

### Issue: "Hash mismatch"
**Solution:** 
- Ensure canonical JSON (sorted keys)
- Check data structure matches exactly
- Verify hashing algorithm (SHA-256)

## Verification Flow Example

```typescript
// 1. Hash credential data
const hash = await hashCredential({
  event: "GDG Hackathon",
  position: "1st",
  date: "2025-02-10"
});

// 2. Add to blockchain (as issuer)
await addCredential(signer, userWallet, hash, "Hackathon Win");

// 3. Verify on-chain
const exists = await credentialHashExists(hash);
console.log(exists); // true

// 4. Full verification
const verified = await verifyCredential(userWallet, credentialData);
console.log(verified); // true
```

## Next Steps

Once testing passes:
1. ✅ Contract is working correctly
2. ✅ Integration with frontend works
3. ✅ Ready to add real credentials
4. ✅ Ready for production deployment (with IPFS/backend)

## Production Checklist

Before going to production:
- [ ] Audit smart contract
- [ ] Test on mainnet fork
- [ ] Set up IPFS/Arweave for off-chain storage
- [ ] Implement backend API
- [ ] Add error handling and retries
- [ ] Optimize gas usage
- [ ] Set up monitoring

