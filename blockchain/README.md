# Reputation Passport Smart Contracts

## Overview

This directory contains the Solidity smart contract for on-chain credential verification.

**Architecture:**
- Only cryptographic hashes are stored on-chain (not raw data)
- Off-chain data is stored in JSON files (prototype) or IPFS (production)
- Only whitelisted issuers can submit credentials
- Public verification allows anyone to check credential authenticity

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PRIVATE_KEY=your_private_key_here
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
POLYGONSCAN_API_KEY=your_key
ETHERSCAN_API_KEY=your_key
```

3. Compile contracts:
```bash
npm run compile
```

4. Deploy to testnet:
```bash
npm run deploy:amoy    # Polygon Amoy
npm run deploy:sepolia # Ethereum Sepolia
```

## Contract Functions

### Issuer Management (Owner Only)
- `addIssuer(address issuer)` - Whitelist an issuer
- `removeIssuer(address issuer)` - Remove issuer from whitelist

### Credential Management (Issuers Only)
- `addCredential(address user, bytes32 hash, string category)` - Add credential hash

### View Functions (Public)
- `getCredentials(address user)` - Get all credential hashes for a user
- `getCredential(bytes32 hash)` - Get credential details by hash
- `credentialExists(bytes32 hash)` - Check if hash exists
- `getCredentialCount(address user)` - Get credential count

## Verification Flow

1. Hash credential data client-side using `hashCredential()`
2. Submit hash to contract via `addCredential()` (issuer only)
3. Verify by comparing client-side hash with on-chain hash

## Production Path

- Replace JSON storage with IPFS/Arweave
- Add backend API for credential management
- Implement gas optimization
- Add batch operations for multiple credentials

