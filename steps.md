# Backend Implementation Steps — Reputation Passport

> Your frontend (React + Vite + TypeScript) and smart contract (`ReputationPassport.sol`) already exist.
> You currently have **no backend server**. Everything runs on mock data (`src/lib/mockData.ts`, `src/lib/mockBlockchain.ts`, `data/*.json`).
> This guide walks you through building a real, working backend from scratch.

---

## Prerequisites

| Tool            | Version  | Why                                                    |
| --------------- | -------- | ------------------------------------------------------ |
| **Node.js**     | ≥ 18 LTS | Runtime for the backend server                         |
| **npm**         | ≥ 9      | Package management                                     |
| **MongoDB**     | ≥ 7      | Database for users, credentials, issuers (or use Atlas)|
| **MetaMask**    | Latest   | Wallet for signing blockchain transactions             |
| **Git**         | Latest   | Version control                                        |

Optional but recommended:
- **MongoDB Compass** — GUI for inspecting your database
- **Postman / Thunder Client** — For testing API endpoints
- A **testnet faucet** (Polygon Amoy or Sepolia) — For gas to deploy/test contracts

---

## Step 1 — Create the Backend Folder & Initialize

```bash
# From the project root (aura-passport1/)
mkdir backend
cd backend
npm init -y
```

Install core dependencies:

```bash
npm install express cors dotenv mongoose ethers jsonwebtoken bcryptjs
npm install -D typescript ts-node @types/express @types/cors @types/node @types/jsonwebtoken @types/bcryptjs nodemon
```

| Package         | Purpose                                       |
| --------------- | --------------------------------------------- |
| `express`       | HTTP server & routing                         |
| `cors`          | Allow frontend (localhost:5173) to call our API|
| `dotenv`        | Environment variable loading                  |
| `mongoose`      | MongoDB ODM (models, queries)                 |
| `ethers`        | Interact with the smart contract              |
| `jsonwebtoken`  | JWT authentication                            |
| `bcryptjs`      | Password hashing for email/password auth      |
| `nodemon`       | Auto-restart server on file changes           |

---

## Step 2 — Project Structure

Create this folder structure inside `backend/`:

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts              # MongoDB connection
│   ├── models/
│   │   ├── User.ts            # User schema
│   │   ├── Credential.ts      # Credential schema
│   │   └── Issuer.ts          # Issuer schema
│   ├── routes/
│   │   ├── auth.ts            # Signup / Login / Wallet auth
│   │   ├── profile.ts         # GET /api/profile/:id
│   │   ├── credentials.ts     # Issue / Verify / List credentials
│   │   ├── graph.ts           # GET /api/graph/:id
│   │   └── issuers.ts         # Issuer management
│   ├── middleware/
│   │   └── auth.ts            # JWT verification middleware
│   ├── services/
│   │   ├── blockchain.ts      # Ethers.js contract interaction
│   │   └── hashing.ts         # SHA-256 credential hashing
│   ├── utils/
│   │   └── helpers.ts         # Shared utilities
│   └── index.ts               # Express app entry point
├── .env                       # Environment variables (DO NOT commit)
├── .env.example               # Template for .env
├── tsconfig.json              # TypeScript config
├── package.json
└── nodemon.json               # Nodemon config for dev
```

Create all the directories:

```bash
mkdir -p src/config src/models src/routes src/middleware src/services src/utils
```

---

## Step 3 — Configure TypeScript

Create `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Step 4 — Environment Variables

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/reputation-passport

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Blockchain
PRIVATE_KEY=your-deployer-wallet-private-key
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
CONTRACT_ADDRESS=your-deployed-contract-address

# GitHub OAuth (optional, for later)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **NEVER commit `.env` to Git!** Add it to `.gitignore`.

---

## Step 5 — Database Connection (`src/config/db.ts`)

```typescript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

---

## Step 6 — Define Mongoose Models

### `src/models/User.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  displayName: string;
  handle: string;
  email: string;
  password?: string;            // null for wallet-only users
  walletAddress?: string;
  avatar: string;
  ensName?: string;
  reputationScore: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  connectedProviders: {
    github?: { id: string; username: string; accessToken: string };
    google?: { id: string; email: string };
  };
  visibility: {
    certificates: boolean;
    repos: boolean;
    endorsements: boolean;
  };
  verified: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  displayName: { type: String, required: true },
  handle: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  walletAddress: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: '' },
  ensName: { type: String },
  reputationScore: { type: Number, default: 0 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'bronze' },
  connectedProviders: {
    github: { id: String, username: String, accessToken: String },
    google: { id: String, email: String },
  },
  visibility: {
    certificates: { type: Boolean, default: true },
    repos: { type: Boolean, default: true },
    endorsements: { type: Boolean, default: true },
  },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
```

### `src/models/Credential.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ICredential extends Document {
  userWallet: string;
  issuerWallet: string;
  category: string;                    // "Hackathon Win", "Certificate", "Achievement"
  data: Record<string, any>;           // Raw credential metadata
  hash: string;                        // SHA-256 hash of `data`
  txHash?: string;                     // On-chain transaction hash (after writing)
  verified: boolean;
  issuedAt: Date;
  createdAt: Date;
}

const CredentialSchema = new Schema<ICredential>({
  userWallet: { type: String, required: true, index: true },
  issuerWallet: { type: String, required: true },
  category: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  hash: { type: String, required: true, unique: true },
  txHash: { type: String },
  verified: { type: Boolean, default: false },
  issuedAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model<ICredential>('Credential', CredentialSchema);
```

### `src/models/Issuer.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IIssuer extends Document {
  walletAddress: string;
  name: string;
  type: string;                // "Educational Institution", "Hackathon Organizer", etc.
  description: string;
  website: string;
  verified: boolean;
  createdAt: Date;
}

const IssuerSchema = new Schema<IIssuer>({
  walletAddress: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, default: '' },
  website: { type: String, default: '' },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IIssuer>('Issuer', IssuerSchema);
```

---

## Step 7 — JWT Auth Middleware (`src/middleware/auth.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
```

---

## Step 8 — Blockchain Service (`src/services/blockchain.ts`)

This is the bridge between your backend and the smart contract. It replaces the mock layer.

```typescript
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
```

---

## Step 9 — Hashing Service (`src/services/hashing.ts`)

```typescript
import crypto from 'crypto';

/**
 * Hash credential data using SHA-256.
 * This hash is what gets stored on-chain.
 * The raw data stays in MongoDB.
 */
export function hashCredentialData(data: Record<string, any>): string {
  // Sort keys for deterministic JSON (same data = same hash every time)
  const canonical = JSON.stringify(data, Object.keys(data).sort());
  const hash = crypto.createHash('sha256').update(canonical).digest('hex');
  return '0x' + hash;
}
```

---

## Step 10 — Build API Routes

### `src/routes/auth.ts` — Signup & Login

```typescript
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { displayName, handle, email, password, walletAddress } = req.body;

    // Check if user exists
    const existing = await User.findOne({ $or: [{ email }, { handle }] });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    // Hash password (if email/password signup)
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const user = await User.create({
      displayName,
      handle,
      email,
      password: hashedPassword,
      walletAddress,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({ user: { id: user._id, displayName, handle, email }, token });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({ user: { id: user._id, displayName: user.displayName, handle: user.handle }, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/wallet — Login/register with wallet address
router.post('/wallet', async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Verify the signature to prove wallet ownership
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid wallet signature' });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = await User.create({
        displayName: `User-${walletAddress.slice(0, 6)}`,
        handle: walletAddress.slice(0, 10),
        email: `${walletAddress.slice(0, 10)}@wallet.local`,
        walletAddress,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress}`,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    res.json({ user: { id: user._id, walletAddress: user.walletAddress }, token });
  } catch (error) {
    res.status(500).json({ error: 'Wallet auth failed' });
  }
});

export default router;
```

> **Note**: Add `import { ethers } from 'ethers';` at the top for the wallet route.

### `src/routes/profile.ts` — User Profile

```typescript
import { Router, Request, Response } from 'express';
import User from '../models/User';
import Credential from '../models/Credential';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/profile/:id — Public profile
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password -connectedProviders');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const credentials = await Credential.find({ userWallet: user.walletAddress });

    res.json({
      user,
      credentials: credentials.map(c => ({
        id: c._id,
        category: c.category,
        data: c.data,
        hash: c.hash,
        verified: c.verified,
        txHash: c.txHash,
        issuedAt: c.issuedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/profile/me — Authenticated user's own profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
```

### `src/routes/credentials.ts` — Issue & Verify Credentials

```typescript
import { Router, Request, Response } from 'express';
import Credential from '../models/Credential';
import Issuer from '../models/Issuer';
import { authenticate, AuthRequest } from '../middleware/auth';
import { hashCredentialData } from '../services/hashing';
import { addCredentialOnChain, verifyCredentialOnChain } from '../services/blockchain';

const router = Router();

// POST /api/credentials/issue — Issue a new credential
router.post('/issue', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userWallet, issuerWallet, category, data } = req.body;

    // Verify issuer exists and is verified
    const issuer = await Issuer.findOne({ walletAddress: issuerWallet, verified: true });
    if (!issuer) return res.status(403).json({ error: 'Issuer not verified' });

    // Hash the credential data
    const hash = hashCredentialData(data);

    // Check for duplicate
    const existing = await Credential.findOne({ hash });
    if (existing) return res.status(409).json({ error: 'Credential already exists' });

    // Write hash on-chain
    let txHash: string | undefined;
    try {
      txHash = await addCredentialOnChain(userWallet, hash, category);
    } catch (chainError) {
      console.error('On-chain write failed:', chainError);
      // Continue — save to DB even if on-chain fails (can retry later)
    }

    // Save to database
    const credential = await Credential.create({
      userWallet,
      issuerWallet,
      category,
      data,
      hash,
      txHash,
      verified: !!txHash,
      issuedAt: new Date(),
    });

    res.status(201).json({ credential, txHash });
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue credential' });
  }
});

// GET /api/credentials/verify/:hash — Verify a credential
router.get('/verify/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;

    // Check database
    const credential = await Credential.findOne({ hash });
    if (!credential) return res.status(404).json({ verified: false, error: 'Credential not found' });

    // Check on-chain
    let onChainVerified = false;
    try {
      onChainVerified = await verifyCredentialOnChain(hash);
    } catch (err) {
      console.error('On-chain verification failed:', err);
    }

    res.json({
      verified: onChainVerified,
      credential: {
        category: credential.category,
        issuerWallet: credential.issuerWallet,
        issuedAt: credential.issuedAt,
        txHash: credential.txHash,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET /api/credentials/user/:wallet — List all credentials for a user
router.get('/user/:wallet', async (req: Request, res: Response) => {
  try {
    const credentials = await Credential.find({ userWallet: req.params.wallet });
    res.json({ credentials });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

export default router;
```

### `src/routes/graph.ts` — Reputation Graph Data

```typescript
import { Router, Request, Response } from 'express';
import Credential from '../models/Credential';

const router = Router();

// GET /api/graph/:wallet — Get graph nodes/edges for a user
router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const credentials = await Credential.find({ userWallet: req.params.wallet });

    // Build graph nodes from real credentials
    const nodes = credentials.map(c => ({
      id: c._id.toString(),
      label: c.data.event || c.data.course || c.data.achievement || c.category,
      type: c.category.toLowerCase().includes('hackathon') ? 'hackathon'
           : c.category.toLowerCase().includes('certificate') ? 'certificate'
           : 'project',
      value: c.verified ? 80 : 40,
      color: c.verified ? '#22C55E' : '#6B7280',
    }));

    // Build edges connecting each credential to a central user node
    const edges = nodes.map(n => ({
      source: 'center',
      target: n.id,
      weight: n.value > 60 ? 4 : 2,
    }));

    // Add center node
    nodes.unshift({
      id: 'center',
      label: req.params.wallet.slice(0, 10) + '...',
      type: 'skill' as any,
      value: 100,
      color: '#3B82F6',
    });

    res.json({ nodes, edges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate graph data' });
  }
});

export default router;
```

---

## Step 11 — Express Server Entry Point (`src/index.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import credentialRoutes from './routes/credentials';
import graphRoutes from './routes/graph';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/graph', graphRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
};

start();
```

---

## Step 12 — Add Scripts to `backend/package.json`

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node src/scripts/seed.ts"
  }
}
```

Create `backend/nodemon.json`:

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/index.ts"
}
```

---

## Step 13 — Seed Script (Import Existing Mock Data)

Create `backend/src/scripts/seed.ts`:

```typescript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Credential from '../models/Credential';
import Issuer from '../models/Issuer';

dotenv.config();

// Data from your existing data/users.json and data/issuers.json
const users = [
  { displayName: 'Rahul Sharma', handle: 'rahulsharma', email: 'rahul@example.com',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', reputationScore: 847, tier: 'gold' as const },
  { displayName: 'Sarah Chen', handle: 'sarahchen', email: 'sarah@example.com',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c22C3c', reputationScore: 923, tier: 'platinum' as const },
];

const issuersData = [
  { walletAddress: '0xISSUER_WALLET_1', name: 'GDG SRMCEM', type: 'Hackathon Organizer',
    description: 'Google Developer Group at SRMCEM', website: 'https://gdg.community.dev', verified: true },
  { walletAddress: '0xISSUER_WALLET_2', name: 'Coursera', type: 'Educational Institution',
    description: 'Online learning platform', website: 'https://coursera.org', verified: true },
  { walletAddress: '0xISSUER_WALLET_3', name: 'GitHub', type: 'Platform',
    description: 'Code hosting platform', website: 'https://github.com', verified: true },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Issuer.deleteMany({});
  console.log('Cleared old data');

  // Seed users
  for (const u of users) {
    await User.create({ ...u, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.handle}`, verified: true });
  }
  console.log(`Seeded ${users.length} users`);

  // Seed issuers
  for (const i of issuersData) {
    await Issuer.create(i);
  }
  console.log(`Seeded ${issuersData.length} issuers`);

  await mongoose.disconnect();
  console.log('✅ Seed complete!');
}

seed().catch(console.error);
```

---

## Step 14 — Deploy the Smart Contract

Before the backend can write credentials on-chain, you need a deployed contract.

```bash
# Go to the blockchain folder
cd blockchain

# Install dependencies
npm install

# Compile the contract
npx hardhat compile

# Option A: Deploy to local Hardhat network (for testing)
npx hardhat run deploy.js --network hardhat

# Option B: Deploy to Polygon Amoy testnet (needs test MATIC)
# 1. Get test MATIC from https://faucet.polygon.technology/
# 2. Set PRIVATE_KEY and POLYGON_AMOY_RPC_URL in blockchain/.env
npx hardhat run deploy.js --network amoy
```

After deployment, copy the **contract address** from the terminal output and paste it into:
1. `backend/.env` → `CONTRACT_ADDRESS=0x...`
2. `src/lib/contract.ts` → update the `CONTRACT_ADDRESS` constant

---

## Step 15 — Run & Test Everything

### Start MongoDB

```bash
# If using local MongoDB:
mongod

# If using MongoDB Atlas: just make sure your MONGODB_URI is correct in .env
```

### Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected: localhost
🚀 Backend running on http://localhost:5000
```

### Seed the Database

```bash
cd backend
npm run seed
```

### Test the API (using curl or Postman)

```bash
# Health check
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Test User","handle":"testuser","email":"test@example.com","password":"password123"}'

# Verify a credential (by hash)
curl http://localhost:5000/api/credentials/verify/0x1234...

# Get profile
curl http://localhost:5000/api/profile/<user-id-from-register-response>

# Get graph data
curl http://localhost:5000/api/graph/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

---

## Step 16 — Connect Frontend to Backend

Update your frontend to call the real backend instead of using mock data.

### Install axios in the frontend:

```bash
# From the project root (aura-passport1/)
npm install axios
```

### Create an API client (`src/lib/api.ts`):

```typescript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### Replace mock data calls:

For example, in `src/hooks/useAuth.ts`:
```typescript
import api from '../lib/api';

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  localStorage.setItem('auth_token', res.data.token);
  return res.data.user;
}
```

Repeat this pattern for profile, credentials, and graph data.

---

## Step 17 — Add VITE_API_URL to Frontend

Create a file in the project root: `.env.local`

```env
VITE_API_URL=http://localhost:5000/api
```

Vite will automatically make this available as `import.meta.env.VITE_API_URL`.

---

## Quick Reference — API Endpoints

| Method  | Endpoint                         | Auth | Description                      |
| ------- | -------------------------------- | ---- | -------------------------------- |
| `POST`  | `/api/auth/register`             | ❌   | Register with email/password     |
| `POST`  | `/api/auth/login`                | ❌   | Login with email/password        |
| `POST`  | `/api/auth/wallet`               | ❌   | Login/register with MetaMask     |
| `GET`   | `/api/profile/:id`               | ❌   | Get public profile               |
| `GET`   | `/api/profile/me`                | ✅   | Get own profile                  |
| `POST`  | `/api/credentials/issue`         | ✅   | Issue a new credential           |
| `GET`   | `/api/credentials/verify/:hash`  | ❌   | Verify a credential on-chain     |
| `GET`   | `/api/credentials/user/:wallet`  | ❌   | List credentials for a user      |
| `GET`   | `/api/graph/:wallet`             | ❌   | Get reputation graph data        |
| `GET`   | `/api/health`                    | ❌   | Health check                     |

---

## What's Next (After Backend Works)

- [ ] **GitHub OAuth** — Connect GitHub to import repos and commit data
- [ ] **Google OAuth** — Connect Google accounts
- [ ] **Recruiter/Institution Portal API** — Search, verify, and batch-issue credentials
- [ ] **Rate Limiting** — Add `express-rate-limit` to protect endpoints
- [ ] **Input Validation** — Add `zod` or `joi` for request body validation
- [ ] **File Uploads** — Use `multer` for certificate PDF uploads
- [ ] **IPFS Integration** — Store credential files on IPFS instead of MongoDB
- [ ] **Admin Dashboard API** — User analytics, issuance reports
- [ ] **WebSocket Notifications** — Real-time updates for credential status
- [ ] **Deployment** — Deploy backend to Railway / Render / Vercel (serverless)
