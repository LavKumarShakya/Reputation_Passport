# Blockchain Integration - Reputation Passport

## Overview

This implementation provides a minimal, verifiable blockchain integration for credential verification.

## Architecture

### On-Chain (Blockchain)
- **Smart Contract**: `ReputationPassport.sol`
- **Storage**: Only cryptographic hashes (bytes32)
- **Access Control**: Whitelisted issuers only
- **Networks**: Polygon Amoy / Ethereum Sepolia testnets

### Off-Chain (Prototype)
- **Storage**: JSON files in `/data` directory
- **Files**: `users.json`, `credentials.json`, `issuers.json`
- **Production Path**: Replace with IPFS/Arweave + Backend API

## File Structure

```
/blockchain
  ├── ReputationPassport.sol    # Smart contract
  ├── deploy.js                  # Deployment script
  ├── hardhat.config.js          # Hardhat configuration
  └── package.json               # Dependencies

/data
  ├── users.json                 # User profile data
  ├── credentials.json           # Credential records
  └── issuers.json               # Issuer metadata

/src/utils
  ├── hashCredential.ts          # SHA-256 hashing utility
  └── verifyCredential.ts        # Verification logic

/src/lib
  ├── contract.ts                # Contract interaction utilities
  └── dataLoader.ts              # JSON data loading
```

## Setup Instructions

### 1. Install Blockchain Dependencies

```bash
cd blockchain
npm install
```

### 2. Configure Environment

Create `blockchain/.env`:
```
PRIVATE_KEY=your_private_key_here
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGONSCAN_API_KEY=your_key
```

### 3. Compile Contract

```bash
cd blockchain
npm run compile
```

### 4. Deploy Contract

```bash
npm run deploy:amoy
```

Copy the deployed address and update `src/lib/contract.ts`:
```typescript
const CONTRACT_ADDRESS = '0x...'; // Your deployed address
```

### 5. Add Issuers

After deployment, call `addIssuer()` for each issuer wallet address.

## Usage

### Hashing Credentials

```typescript
import { hashCredential } from '@/utils/hashCredential';

const credentialData = {
  event: "GDG Hackathon",
  position: "1st",
  date: "2025-02-10"
};

const hash = await hashCredential(credentialData);
// Returns: "0x..."
```

### Adding Credentials (Issuer Only)

```typescript
import { addCredential } from '@/lib/contract';

// Requires connected wallet that is whitelisted issuer
const receipt = await addCredential(
  signer,
  userWallet,
  hash,
  "Hackathon Win"
);
```

### Verifying Credentials

```typescript
import { verifyCredential } from '@/utils/verifyCredential';

const verified = await verifyCredential(
  userWallet,
  credentialData
);
// Returns: true if hash matches on-chain
```

## Data Schema

### users.json
```json
{
  "0xUSER_WALLET": {
    "name": "Rahul Sharma",
    "role": "Student",
    "reputationScore": 847
  }
}
```

### credentials.json
```json
[
  {
    "userWallet": "0xUSER_WALLET",
    "issuerWallet": "0xISSUER_WALLET",
    "category": "Hackathon Win",
    "data": {
      "event": "GDG Hackathon",
      "position": "1st",
      "date": "2025-02-10"
    }
  }
]
```

### issuers.json
```json
{
  "0xISSUER_WALLET": {
    "name": "GDG SRMCEM",
    "verified": true
  }
}
```

## Security Notes

1. **Private Keys**: Never commit private keys to version control
2. **Hashing**: Always use canonical JSON for consistent hashing
3. **Verification**: On-chain hash is the source of truth
4. **Issuers**: Only whitelisted addresses can submit credentials

## Production Considerations

- Replace JSON files with IPFS/Arweave storage
- Add backend API for credential management
- Implement gas optimization strategies
- Add batch operations for efficiency
- Consider Layer 2 solutions for lower costs

