<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-Polygon-7B3FE4?style=for-the-badge&logo=polygon&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Solidity-^0.8.24-363636?style=for-the-badge&logo=solidity&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/License-GPL_v3-blue?style=for-the-badge" />
</p>

# 🛡️ ReputationPassport

> **Your credentials. Verified. On-chain. Forever.**

A decentralized, self-sovereign reputation platform that transforms professional and academic achievements into tamper-proof, cryptographically verifiable digital proof on the blockchain.

Instead of relying on resumes, PDFs, or screenshots — credentials such as certificates, GitHub activity, and event participation are **SHA-256 hashed** and stored **on-chain** via a Solidity smart contract on **Polygon**. Any verifier (recruiter, institution, or organizer) can independently confirm authenticity **without trusting the platform or the user**.

Each user receives a **Dynamic NFT Reputation Passport** — a 3D holographic card that visually evolves across **5 reputation tiers** (Bronze → Diamond) as new verified credentials are added, powered by a **Soulbound Token (SBT)** that cannot be transferred or sold.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Onboarding Pipeline](#-onboarding-pipeline)
- [Reputation Scoring Engine](#-reputation-scoring-engine)
- [Smart Contract](#-smart-contract)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Roadmap](#-roadmap)
- [Impact & SDG Alignment](#-impact--sdg-alignment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

### 🪪 Dynamic NFT Profile Card
- 3D holographic card with **mouse-tracking parallax** (±10° X/Y rotation)
- **5 reputation tiers** — each shifts gradient, glow intensity, particle density, and badge count
- Scanline CRT animation overlays and grain textures
- "Mint SBT" button for on-chain Soulbound Token minting

| Tier | Score | Visual |
|------|-------|--------|
| 🥉 **Bronze** | 0–199 | Amber / Orange |
| 🥈 **Silver** | 200–499 | Slate / Gray |
| 🥇 **Gold** | 500–799 | Yellow / Amber |
| 💜 **Platinum** | 700–899 | Purple / Violet |
| 💎 **Diamond** | 900+ | Cyan / Teal |

### 🚀 Multi-Step Onboarding Pipeline
- **5-step guided onboarding** with real-time progress tracking and animated transitions
- **Step 1 — Sovereign Identity:** Set display name, handle (unique), email, and avatar upload
- **Step 2 — Data Vectors:** Connect reputation sources (GitHub OAuth, LinkedIn, portfolio URL)
- **Step 3 — Cryptographic Proofs:** Upload certificates with metadata (certificate ID, verifiable link, recipient profile, issuer name) and file attachments (PDF/images converted to base64)
- **Step 4 — Access Control:** Configure visibility permissions per credential type
- **Step 5 — Node Deployment:** Preview Dynamic NFT Card, SHA-256 hash all credential data, write hashes on-chain via Polygon smart contract, and persist to MongoDB
- Each certificate is individually hashed, anchored on-chain, and stored as a verifiable credential

### ⛓️ On-Chain Credential Verification
- `ReputationPassport.sol` smart contract stores **SHA-256 credential hashes** on Polygon
- **Whitelisted issuer model** — only verified institutions can issue credentials
- **Trustless public verification** — anyone can query `credentialExists(hash)` directly on-chain
- **Cost:** < $0.001 per credential hash on Polygon

### 📊 Reputation Graph (Node Topology)
- Interactive **force-directed** and **radial** layout graph visualization
- Nodes for skills, hackathons, certificates, and projects — all connected to the user
- **Three-layer tech-stack heuristic** scans GitHub repos to auto-detect proficiency
- **Lazy backfill** — auto-scans GitHub on first graph visit with zero user setup

### 🏛️ Institution Portal
- Verified issuers can issue credentials to user wallet addresses
- Credentials are hashed (SHA-256) and written to the smart contract
- Real-time issuance analytics dashboard

### 🔍 Recruiter Dashboard
- Search and filter verified candidates by name, handle, wallet, or tier
- View credential count, tier, and on-chain verification status per candidate
- Sort by reputation score or credential count

### 📊 Admin Dashboard
- Live system metrics: total users, certificates, on-chain verification rate
- Institution leaderboard and recent activity feed
- Powered by real-time aggregation pipelines (`/api/admin/*`)

### 🔐 Authentication & Identity
- **Email/password** registration and login (bcrypt 12 rounds + JWT)
- **MetaMask** wallet authentication (`ethers.verifyMessage` signature verification)
- **GitHub OAuth 2.0** (deep profile + tech-stack sync across up to 100 repos)
- **Mock Wallet** login for local development and testing
- **Identity Matrix** — self-sovereign profile management (update handle, alias, email)
- **Account Purge** — irreversible node termination (wipes all user data & credentials)

### 🏆 Achievement System
- Trigger-based gamified badges earned through platform activity
- Rarity tiers: Common → Uncommon → Rare → Epic → Legendary
- Duplicate prevention via MongoDB compound uniqueness (`userId + type`)

### ⚙️ Settings (6 Tabs — Cyberpunk Vocabulary)
| Tab | Internal Key | Display Name |
|-----|-------------|-------------|
| 1 | account | Identity Matrix |
| 2 | connections | Network Bridges |
| 3 | wallet | Gas & Execution |
| 4 | privacy | Telemetry Bounds |
| 5 | notifications | Event Triggers |
| 6 | security | Protocol Defense |

---

## 🏗 Architecture

```
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────┐
│    FRONTEND          │        │    BACKEND           │        │   BLOCKCHAIN     │
│                      │        │                      │        │                  │
│  React 18 + TS       │        │  Express + TS        │        │  Solidity ^0.8.24│
│  Vite 5              │ REST   │  MongoDB (Mongoose)  │ Ethers │  ERC-721 + SBT   │
│  Tailwind + shadcn   │──────▶│  JWT + GitHub OAuth  │ ──────▶│  Whitelisted     │
│  Framer Motion       │  API   │  SHA-256 Hashing     │  v6    │  Issuer Model    │
│  Ethers.js v6        │        │  bcryptjs Auth       │        │  OpenZeppelin    │
│                      │        │                      │        │                  │
│  Vercel (hosting)    │        │  Render (hosting)    │        │  Polygon Amoy    │
└──────────────────────┘        └──────────┬───────────┘        └──────────────────┘
                                          │
                                ┌─────────▼─────────┐
                                │   MongoDB Atlas   │
                                │   4 Collections   │
                                │   Users           │
                                │   Credentials     │
                                │   Issuers         │
                                │   Achievements    │
                                └───────────────────┘
```

**Data Distribution:**
- **Off-chain (MongoDB):** Full user profiles, raw credential metadata, certificate file data (base64), issuer registrations, achievements
- **On-chain (Polygon):** 32-byte credential hashes, issuer whitelist, user credential mappings, SBT tokens

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18 | Component-based UI |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 5 | Fast bundler & dev server |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **Framer Motion** | 11.x | Animations & 3D card effects |
| **shadcn/ui** + Radix | — | Design system components |
| **Ethers.js** | v6 | Blockchain interaction |
| **Axios** | 1.x | API communication |
| **React Router** | v6 | Client-side routing |
| **React Query** | v5 | Server state management |
| **Recharts** | 2.x | Data visualization charts |
| **Lucide React** | — | Icon library |
| **Sonner** | — | Toast notifications |
| **Zod** | 3.x | Schema validation |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | Runtime |
| **Express** | 4.x | REST API server |
| **TypeScript** | 5.x | Type safety |
| **MongoDB** (Mongoose) | — | User, credential, issuer, achievement storage |
| **JWT** (jsonwebtoken) | — | Stateless authentication (7-day expiry) |
| **bcryptjs** | — | Password hashing (12 salt rounds) |
| **Ethers.js** | v6 | On-chain credential writes |
| **dotenv** | — | Environment configuration |
| **CORS** | — | Cross-origin resource sharing |

### Blockchain
| Technology | Version | Purpose |
|---|---|---|
| **Solidity** | ^0.8.24 | Smart contract language |
| **Hardhat** | — | Development, compilation, deployment, testing |
| **OpenZeppelin** | — | ERC721URIStorage + Ownable base contracts |
| **Polygon Amoy** | Testnet | Target deployment network |
| **SHA-256 / Keccak-256** | — | Credential hashing |

### Design Language: Crypto-Brutalist
- **Zero border radius** — sharp edges on all elements (`rounded-none`)
- **Monospace typography** — JetBrains Mono for labels and system text
- **Bold display headings** — Space Grotesk, always uppercase
- **Grain texture overlay** — noise PNG with `mix-blend-overlay`
- **Scanline animations** — horizontal CRT simulation across card surfaces
- **Dark palette** — `#0A0A0A` background with high-contrast tier accent colors

---

## 🚀 Onboarding Pipeline

The onboarding system is a 5-step guided flow that takes a new user from raw authentication to a fully anchored on-chain reputation node.

### Flow Diagram

```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  STEP 1        │    │  STEP 2        │    │  STEP 3        │    │  STEP 4        │    │  STEP 5        │
│  Sovereign     │───▶│  Data         │───▶│  Cryptographic │───▶│  Access       │───▶│  Node          │
│  Identity      │    │  Vectors       │    │  Proofs        │    │  Control       │    │  Deployment    │
│                │    │                │    │                │    │                │    │                │
│  • Display Name│    │  • GitHub OAuth│    │  • Certificate │    │  • Visibility  │    │  • NFT Preview │
│  • Handle      │    │  • LinkedIn    │    │    Upload      │    │    per type    │    │  • SHA-256 Hash│
│  • Email       │    │  • Portfolio   │    │  • Issuer Name │    │  • Public /    │    │  • On-chain TX │
│  • Avatar      │    │  • Website     │    │  • Cert ID *   │    │    Private     │    │  • MongoDB Save│
│                │    │                │    │  • Verify Link*│    │                │    │  • Redirect    │
│                │    │                │    │  • Profile Link│    │                │    │    to Profile  │
└────────────────┘    └────────────────┘    └────────────────┘    └────────────────┘    └────────────────┘
                                              * = optional
```

### Certificate Upload Fields
| Field | Required | Description |
|-------|----------|-------------|
| **Certificate Name** | ✅ | Name/title of the certificate |
| **Issuer Name** | ✅ | Organization or institution that issued the certificate |
| **Certificate ID** | ❌ | Unique identifier printed on the certificate |
| **Verifiable Link** | ❌ | URL where the certificate can be independently verified |
| **Recipient Profile Link** | ❌ | Your profile on the platform that issued the certificate |
| **File Upload** | ❌ | PDF or image of the certificate (converted to base64, stored in MongoDB) |

### Credential Hashing Process
1. All certificate metadata fields are concatenated into a JSON payload
2. The payload is **SHA-256 hashed** to produce a 32-byte deterministic hash
3. The hash is written on-chain via `addCredentialOnChain(wallet, hash, "Certificate")`
4. The full credential (metadata + hash + txHash) is saved to MongoDB
5. If on-chain write fails (e.g., no local Hardhat node), the credential is still saved to MongoDB with `verified: false`

---

## 📊 Reputation Scoring Engine

### GitHub-Based Scoring Formula (Max 1000 Points)

```javascript
reputationScore =
    Math.min(followers × 5,   200)    // Community trust        (20%)
  + Math.min(publicRepos × 10, 200)   // Productivity           (20%)
  + Math.min(totalStars × 20,  400)   // Code quality & impact  (40%)
  + Math.min(accountAge × 20,  200)   // Experience             (20%)
```

| Factor | Multiplier | Max Points | To Max Out |
|--------|-----------|-----------|------------|
| Followers | ×5 | 200 | 40 followers |
| Public Repos | ×10 | 200 | 20 repos |
| Total Stars | ×20 | 400 | 20 stars |
| Account Age | ×20 | 200 | 10 years |

### Three-Layer Tech-Stack Heuristic

The platform employs a **multi-source analysis algorithm** to determine technology proficiency:

| Layer | Source | Weight | Method |
|-------|--------|--------|--------|
| **Layer 1** | GitHub `language` field | +50 per repo | Aggregate primary language across all public repos |
| **Layer 2** | Repository `topics` array | +70 popular / +10 other | Analyze user-defined tags (34 recognized frameworks) |
| **Layer 3** | `package.json` parsing | +100 for popular | Fetch & parse dependencies from top 5 recent JS/TS repos |

**Confidence interpretation:** 0–30 (Low) → 31–70 (Medium) → 71–150 (High) → 151+ (Core Technology)

---

## 📜 Smart Contract

**`ReputationPassport.sol`** — Solidity ^0.8.24 with OpenZeppelin (ERC721URIStorage + Ownable)

### Core Functions

| Function | Access | Description |
|----------|--------|-------------|
| `addIssuer(address)` | Owner only | Whitelist an institution as credential issuer |
| `removeIssuer(address)` | Owner only | Remove issuer from whitelist |
| `addCredential(address, bytes32, string)` | Issuers only | Store a credential hash for a user |
| `credentialExists(bytes32)` | Public (view) | Check if a credential hash exists on-chain |
| `getCredentials(address)` | Public (view) | Get all credential hashes for a user |
| `getCredential(bytes32)` | Public (view) | Get full credential struct by hash |
| `mintSBT(address, string)` | Owner only | Mint a non-transferable Soulbound Token |

### Events
- `CredentialAdded(address indexed user, bytes32 hash, address indexed issuer)`
- `IssuerAdded(address indexed issuer)`
- `IssuerRemoved(address indexed issuer)`
- `SBTMinted(address indexed to, uint256 tokenId)`

### Key Properties
- **Soulbound:** `_update()` override prevents token transfers (only mint & burn allowed)
- **Duplicate prevention:** `require(credentials[hash].timestamp == 0)`
- **Gas cost:** ~85,000 gas per `addCredential` (< $0.001 on Polygon)

---

## 📁 Project Structure

```
aura-passport1/
├── src/                           # React frontend (Vite + TypeScript)
│   ├── components/                # Reusable UI components
│   │   ├── DynamicNFTCard.tsx     #   3D holographic reputation card
│   │   ├── ReputationGraph.tsx    #   Force-directed/radial graph
│   │   ├── CertificateCard.tsx    #   Individual credential display
│   │   ├── AchievementBadge.tsx   #   Rarity-glowed achievement badge
│   │   ├── OnChainStatus.tsx      #   On-chain verification indicator
│   │   ├── ReputationPill.tsx     #   Reputation strip pills
│   │   ├── Timeline.tsx           #   Chronological credential events
│   │   ├── layout/                #   Layout components (AppLayout, TopNav, Sidebar)
│   │   └── ui/                    #   shadcn/ui primitives
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.tsx            #   Authentication context & JWT management
│   │   ├── useWallet.ts           #   MetaMask wallet connection
│   │   ├── useProfileData.ts      #   Profile & achievements data fetching
│   │   └── useAdminData.ts        #   Admin dashboard data
│   ├── pages/                     # Route pages (16 total)
│   │   ├── LandingPage.tsx        #   Marketing hero with Neural Synapse animation
│   │   ├── AuthPage.tsx           #   Multi-method authentication
│   │   ├── HomePage.tsx           #   Dashboard with DynamicNFTCard
│   │   ├── ProfilePage.tsx        #   User profile + credentials + velocity curve
│   │   ├── OnboardingPage.tsx     #   5-step onboarding pipeline
│   │   ├── GraphPage.tsx          #   Interactive reputation graph
│   │   ├── RecruiterPage.tsx      #   Verified candidate search
│   │   ├── InstitutionPage.tsx    #   Credential issuance portal
│   │   ├── AdminPage.tsx          #   System metrics dashboard
│   │   ├── SettingsPage.tsx       #   6-tab settings (Identity Matrix, etc.)
│   │   ├── AchievementsPage.tsx   #   Gamified badges display
│   │   ├── TimelinePage.tsx       #   Chronological activity
│   │   ├── TestBlockchainPage.tsx #   Developer blockchain testing
│   │   ├── AuthCallbackPage.tsx   #   OAuth redirect handler
│   │   └── NotFound.tsx           #   404 page
│   ├── lib/                       # API client, contract config, mock data
│   │   ├── api.ts                 #   Axios instance with JWT interceptor
│   │   ├── contract.ts            #   Ethers.js contract interaction
│   │   └── mockData.ts            #   Development mock data
│   └── utils/                     # Verification utilities
├── backend/                       # Express API server (TypeScript)
│   └── src/
│       ├── index.ts               # Server entry point (50MB body limit for file uploads)
│       ├── routes/                # API route handlers
│       │   ├── auth.ts            #   Registration, login, OAuth, wallet auth
│       │   ├── profile.ts         #   Profile CRUD + onboarding endpoint
│       │   ├── credentials.ts     #   Credential issuance & verification
│       │   ├── graph.ts           #   Reputation graph data generation
│       │   ├── admin.ts           #   System-wide statistics
│       │   ├── achievement.ts     #   Achievement queries
│       │   ├── issuers.ts         #   Issuer management
│       │   └── users.ts           #   User listing
│       ├── models/                # Mongoose schemas
│       │   ├── User.ts            #   User model (profile, wallet, visibility, techStack)
│       │   ├── Credential.ts      #   Credential model (hash, txHash, data, verified)
│       │   ├── Issuer.ts          #   Issuer model (institution whitelist)
│       │   └── Achievement.ts     #   Achievement model (badges, rarity)
│       ├── middleware/            # JWT authentication middleware
│       ├── services/              # Business logic services
│       │   └── blockchain.ts      #   Ethers.js on-chain write service
│       ├── config/                # Database connection
│       ├── scripts/               # Database seed script
│       └── utils/                 # Hashing & utility functions
├── blockchain/                    # Smart contract (Hardhat)
│   ├── contracts/
│   │   └── ReputationPassport.sol # Main smart contract (ERC-721 + SBT)
│   ├── deploy.js                  # Deployment script
│   ├── test.js                    # Contract unit tests
│   └── hardhat.config.js          # Hardhat configuration (localhost + Amoy)
├── doc/                           # Project documentation (14 documents)
├── vercel.json                    # Vercel SPA routing config
├── render.yaml                    # Render infrastructure-as-code
└── package.json                   # Frontend dependencies
```

---

## 🚀 Getting Started

### Prerequisites

| Software | Version | Required For |
|----------|---------|-------------|
| **Node.js** | v18+ | Runtime |
| **npm** | v9+ | Package management |
| **MongoDB** | Atlas or local | Database |
| **MetaMask** | Latest (optional) | Wallet authentication |
| **Git** | v2.30+ | Version control |

### 1. Clone & Install

```bash
git clone https://github.com/LavKumarShakya/Reputation_Passport.git
cd Reputation_Passport

# Frontend dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..

# Blockchain dependencies
cd blockchain && npm install && cd ..
```

### 2. Configure Environment

**Backend** — create `backend/.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/reputation-passport?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_secure_random_secret_key    # Generate: openssl rand -hex 32
JWT_EXPIRES_IN=7d

# Blockchain (Hardhat Local Node)
PRIVATE_KEY=0x_your_wallet_private_key
CONTRACT_ADDRESS=0x_deployed_contract_address
POLYGON_AMOY_RPC_URL=http://127.0.0.1:8545

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# URLs
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:5000
```

**Frontend** — create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Application

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → Express server on http://localhost:5000

# Terminal 2 — Frontend
npm run dev
# → Vite dev server on http://localhost:8080

# Terminal 3 (Optional) — Local Blockchain
cd blockchain && npx hardhat node
# → Hardhat node on http://127.0.0.1:8545
```

### 4. Deploy Smart Contract (Local)

```bash
cd blockchain
npx hardhat compile
npx hardhat run deploy.js --network localhost
```

Copy the deployed contract address into `backend/.env` → `CONTRACT_ADDRESS`.

### 5. Seed Test Data

```bash
cd backend && npm run seed
```

Creates **5 test users** (one per reputation tier), sample issuers, and credentials for visual testing via the **Dev Mode: Mock Wallet Login** on the Auth page.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWTs | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `PRIVATE_KEY` | Wallet private key for on-chain writes | `0x...` |
| `CONTRACT_ADDRESS` | Deployed smart contract address | `0x...` |
| `POLYGON_AMOY_RPC_URL` | Polygon RPC endpoint | `https://rpc-amoy.polygon.technology` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | From GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | From GitHub Developer Settings |
| `FRONTEND_URL` | Frontend origin (for CORS) | `http://localhost:8080` |
| `BACKEND_URL` | Backend URL | `http://localhost:5000` |

### Frontend (`.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api`
**Authentication:** JWT Bearer token in `Authorization` header
🔒 = Requires authentication

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register with email/password |
| `POST` | `/auth/login` | Login with email (or handle) + password |
| `POST` | `/auth/wallet` | MetaMask signature verification login |
| `GET` | `/auth/github` | Initiate GitHub OAuth flow |
| `GET` | `/auth/github/callback` | Handle GitHub OAuth callback |
| `POST` | `/auth/mock-wallet` | Dev-only mock wallet login |
| `POST` | `/auth/logout-all` 🔒 | Invalidate all sessions (increment tokenVersion) |

### Profile (`/api/profile`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/profile/me` 🔒 | Get authenticated user's profile + credentials |
| `GET` | `/profile/:id` | Get public profile by ID, wallet, or handle |
| `PATCH` | `/profile` 🔒 | Update profile fields |
| `POST` | `/profile/onboard` 🔒 | **Full onboarding pipeline** — saves identity, hashes & anchors certificates on-chain |
| `DELETE` | `/profile` 🔒 | **Account Purge** — permanently delete account and all associated data |

### Onboard Request Body (`POST /api/profile/onboard`)

```json
{
  "displayName": "Lav Kumar Shakya",
  "handle": "lavkumarshakya",
  "email": "user@example.com",
  "walletAddress": "0x...",
  "avatar": "data:image/png;base64,...",
  "visibility": {
    "certificates": true,
    "repos": true,
    "endorsements": false
  },
  "certificates": [
    {
      "name": "AWS Solutions Architect",
      "issuerName": "Amazon Web Services",
      "certificateId": "AWS-SAA-C03-12345",
      "verifiableLink": "https://verify.aws.com/...",
      "recipientProfileLink": "https://credly.com/...",
      "fileName": "aws-cert.pdf",
      "fileSize": 245000,
      "fileType": "application/pdf",
      "fileData": "data:application/pdf;base64,..."
    }
  ]
}
```

### Credentials (`/api/credentials`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/credentials/issue` 🔒 | Issue a credential (hashes + writes on-chain) |
| `GET` | `/credentials/verify/:hash` | Public credential verification |
| `GET` | `/credentials/user/:wallet` | Get all credentials for a wallet |
| `GET` | `/credentials/issuer/:wallet` | Get all credentials issued by an issuer |

### Graph (`/api/graph`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/graph/:identifier` | Generate reputation graph data (nodes + edges) |

### Admin (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/stats` 🔒 | System-wide statistics |
| `GET` | `/admin/activity` 🔒 | Recent credential and user activity |
| `GET` | `/admin/institutions` 🔒 | Institution leaderboard |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/achievements/:userId` | Get user achievements |
| `GET` | `/issuers` | List all registered issuers |
| `GET` | `/users` | List all verified users |

> **Full API documentation** with request/response examples is available in [`doc/11_API_Documentation.md`](doc/11_API_Documentation.md).

---

## 🌐 Deployment

### Production Architecture

| Component | Host | Details |
|-----------|------|---------|
| **Frontend** | Vercel | CDN-distributed React SPA, auto SSL |
| **Backend** | Render | Node.js Express API, auto SSL |
| **Database** | MongoDB Atlas | Managed cloud, auto-scaling, encryption at rest |
| **Blockchain** | Polygon Amoy | Testnet smart contract |

### Deploy Frontend (Vercel)

1. Import GitHub repository on [Vercel](https://vercel.com)
2. Framework Preset: **Vite** → Build: `npm run build` → Output: `dist`
3. Set environment variable: `VITE_API_URL=https://your-api.onrender.com/api`
4. SPA routing is handled by [`vercel.json`](vercel.json)

### Deploy Backend (Render)

1. Create Web Service on [Render](https://render.com) → connect GitHub repo
2. Root directory: `backend` → Build: `npm install && npm run build` → Start: `npm start`
3. Set all environment variables from `backend/.env` with production values
4. Set `NODE_ENV=production` and update `FRONTEND_URL` to your Vercel domain

### Deploy Smart Contract (Polygon Amoy)

```bash
# Get test MATIC from https://faucet.polygon.technology/
cd blockchain
npx hardhat run deploy.js --network amoy

# Optional: Verify on Polygonscan
npx hardhat verify --network amoy <CONTRACT_ADDRESS>
```

### GitHub OAuth Setup

| Field | Development | Production |
|-------|------------|-----------|
| Homepage URL | `http://localhost:8080` | `https://your-app.vercel.app` |
| Callback URL | `http://localhost:5000/api/auth/github/callback` | `https://your-api.onrender.com/api/auth/github/callback` |

> **Full deployment guide** with troubleshooting is available in [`doc/14_Deployment_Guide.md`](doc/14_Deployment_Guide.md).

---

## 🧪 Testing

### Smart Contract Tests (Implemented)

```bash
cd blockchain
npx hardhat test
```

Covers: deployment, issuer management, credential CRUD, duplicate prevention, SBT minting, transfer blocking, gas estimation.

### Backend & Frontend Tests (Planned)

Automated unit and integration test suites for the backend and frontend are designed but not yet implemented. The test plan covers:

- **Unit tests:** Hashing service, reputation scoring, authentication, JWT middleware, React hooks, components
- **Integration tests:** API flows, backend ↔ blockchain, database operations
- **E2E tests:** Registration → dashboard, OAuth → scoring, credential issuance → verification, recruiter search, account deletion

> **Full testing plan** is available in [`doc/13_Testing_Plan.md`](doc/13_Testing_Plan.md).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server (Vite, port 8080) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |
| `cd backend && npm run dev` | Start backend with hot-reload (port 5000) |
| `cd backend && npm run seed` | Seed database with test data |
| `cd blockchain && npx hardhat compile` | Compile smart contract |
| `cd blockchain && npx hardhat test` | Run contract unit tests |
| `cd blockchain && npx hardhat node` | Start local blockchain node |

---

## 🗺 Roadmap

```
 Q3 2026            Q4 2026            Q1 2027            Q2 2027
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  ✅ Alpha    │   │  ✅ Beta     │  │  📋 v1.0     │   │  📋 v2.0     │
│              │   │              │   │              │   │              │
│  Core auth   │   │  On-chain    │   │  SBT minting │   │  ZK proofs   │
│  GitHub      │   │  verification│   │  Mainnet     │   │  Multi-chain │
│  scoring     │   │  Recruiter   │   │  Mobile app  │   │  DAO         │
│  NFT card    │   │  + Institution│  │  API market  │   │  governance  │
│  16 pages    │   │  portals     │   │  CI/CD       │   │  AI skill    │
│  Onboarding  │   │  Graph + SBT │   │  100K users  │   │  assessment  │
│  pipeline    │   │              │   │              │   │              │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

### Upcoming Features

| Feature | Target | Priority |
|---------|--------|----------|
| Polygon **mainnet** deployment | v1.0 | High |
| **SBT minting** UI + metadata API | v1.0 | High |
| IPFS/Arweave credential storage | v1.1 | High |
| Multi-chain support (Arbitrum, Optimism) | v1.1 | High |
| Public verification REST API | v1.1 | High |
| **Zero-Knowledge Proofs** (ZK-SNARKs) | v2.0 | High |
| DAO-based issuer governance | v2.0 | Medium |
| AI code quality analysis | v2.0 | High |
| React Native mobile app | v2.0 | High |
| Multi-platform scoring (LinkedIn, ORCID) | v2.0 | Medium |

---

## 🌍 Impact & SDG Alignment

### Why It Matters

| Problem | Impact |
|---------|--------|
| 78% of resumes contain misleading info | Trustless on-chain verification eliminates fabrication |
| Background checks cost $30–$200 | On-chain verification costs < $0.001 |
| Verification takes 3–14 days | Blockchain query returns instantly |
| Credentials scattered across 8+ platforms | Unified, portable reputation passport |
| Centralized platforms control your data | Self-sovereign identity — users own everything |

### UN Sustainable Development Goals

| SDG | Contribution |
|-----|-------------|
| **SDG 4** — Quality Education | Verifiable credentials from any institution gain equal on-chain credibility |
| **SDG 8** — Decent Work | Merit-based, transparent hiring through verified reputation |
| **SDG 9** — Innovation | Blockchain infrastructure for digital identity, open-source |
| **SDG 10** — Reduced Inequalities | Level playing field for developers globally — bootcamp grads, self-taught, developing nations |
| **SDG 16** — Strong Institutions | Trustless verification ensures institutional accountability |

---

## 📚 Documentation

The `doc/` directory contains **14 comprehensive documents** covering every aspect of the project:

| # | Document | Description |
|---|----------|-------------|
| 01 | Product Requirements Document | Full PRD with user stories and requirements |
| 02 | Problem Research Report | Market research and problem validation |
| 03 | Solution Architecture | System design and architecture decisions |
| 04 | Business Model Canvas | Revenue model and unit economics |
| 05 | [Pitch Deck](doc/05_Pitch_Deck.md) | Competition presentation deck |
| 06 | [UI/UX Design](doc/06_UI_UX_Design.md) | Crypto-Brutalist design system, page specs |
| 07 | [AI/ML Design](doc/07_AI_ML_Design.md) | Scoring algorithms and tech-stack heuristic |
| 08 | [Prototype Roadmap](doc/08_Prototype_Roadmap.md) | Sprint-by-sprint development timeline |
| 09 | [Impact Assessment](doc/09_Impact_Assessment.md) | Social, economic, and environmental impact |
| 10 | [Risk & Ethics](doc/10_Risk_Ethics.md) | Risk matrix, privacy, fairness, compliance |
| 11 | [API Documentation](doc/11_API_Documentation.md) | Full REST API reference with examples |
| 12 | [Database Design](doc/12_Database_Design.md) | MongoDB schemas, relationships, queries |
| 13 | [Testing Plan](doc/13_Testing_Plan.md) | Multi-layer testing strategy and test cases |
| 14 | [Deployment Guide](doc/14_Deployment_Guide.md) | Setup, deploy, monitor, and troubleshoot |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- TypeScript strict mode
- Crypto-Brutalist design principles (zero border radius, monospace labels, uppercase headings)
- Conventional commit messages

---

## 👨‍💻 Author

**Lav Kumar Shakya** — Full-Stack Web3 Developer

- Architecture: Three-tier system (React + Express + Solidity)
- Blockchain: Smart contract design, Polygon deployment, Soulbound Tokens
- AI/ML: Three-layer tech-stack heuristic for automated reputation scoring
- Design: Crypto-Brutalist design system with dynamic NFT visuals

---

## 📄 License

This project is open-source and available under the [GNU General Public License v3.0](LICENSE.md).

---

<p align="center">
  <b>Your credentials. Verified. On-chain. Forever.</b>
  <br/><br/>
  <a href="https://github.com/LavKumarShakya/Reputation_Passport">GitHub</a> · <a href="doc/11_API_Documentation.md">API Docs</a> · <a href="doc/14_Deployment_Guide.md">Deploy Guide</a>
</p>
