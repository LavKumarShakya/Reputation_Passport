# ReputationPassport

A decentralized reputation verification platform that transforms academic and professional achievements into tamper-proof, verifiable digital proof on the blockchain.

Instead of relying on resumes, PDFs, or screenshots, credentials—certificates, GitHub activity, event participation—are cryptographically hashed and stored on-chain. Any verifier (recruiter, institution, or organizer) can independently verify authenticity without trusting the platform or the user.

Each user receives a **Dynamic NFT Reputation Passport** that visually evolves across 5 tiers (Bronze → Diamond) as new verified credentials are added.

---

## Features

### 🪪 Dynamic NFT Profile Card
- 3D holographic card with mouse-tracking parallax
- 5 reputation tiers: **Bronze** (0–299), **Silver** (300–499), **Gold** (500–699), **Platinum** (700–899), **Diamond** (900+)
- Each tier shifts the card's gradient, glow intensity, particle effects, and badge count
- "Mint SBT" button for future Soulbound Token minting

### 🏛️ Institution Portal
- Verified issuers can issue credentials to user wallet addresses
- Certificates are hashed (Keccak-256) and written to the `ReputationPassport` smart contract
- Real-time dashboard with issuance analytics

### 🔍 Recruiter Dashboard
- Search and filter verified candidates
- View credential count, tier, and verification status

### 📊 Admin Dashboard
- Live system metrics: total users, certificates, on-chain verification rate
- Institution leaderboard and recent activity feed
- Powered by real-time backend API (`/api/admin/*`)

### ⛓️ On-Chain Verification
- `ReputationPassport.sol` smart contract stores credential hashes
- Whitelisted issuer model for trust
- Public verification: anyone can query a hash to confirm authenticity
- Transaction hashes linked to Polygon/local explorer

### 🔐 Authentication
- Email/password registration and login (bcrypt + JWT)
- Web3 wallet authentication (MetaMask signature verification)
- **Dev Mode:** Mock wallet login with 5 pre-seeded tier accounts for testing
- GitHub OAuth 2.0 integration (redirect-based flow)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** + TypeScript | Component-based UI |
| **Vite** | Fast bundler & dev server |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations & 3D card effects |
| **shadcn/ui** | Design system components |
| **Ethers.js v6** | Blockchain interaction |
| **Axios** | API communication |
| **React Router v6** | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** + Express 5 | REST API server |
| **TypeScript** | Type safety |
| **MongoDB** (Mongoose) | User, credential, issuer storage |
| **JWT** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Ethers.js v6** | On-chain credential writes |

### Blockchain
| Technology | Purpose |
|---|---|
| **Solidity** | Smart contract language |
| **Hardhat** | Development, compilation, deployment |
| **Polygon Amoy / Local Hardhat Node** | Target networks |
| **Keccak-256** | Credential hashing |

---

## Project Structure

```
aura-passport1/
├── src/                    # React frontend
│   ├── components/         # UI components (DynamicNFTCard, ReputationGraph, etc.)
│   ├── hooks/              # Custom hooks (useAuth, useProfile, useAdminData)
│   ├── pages/              # Route pages (Profile, Auth, Admin, Institution, etc.)
│   ├── lib/                # API client, contract config, mock data
│   └── utils/              # Verification utilities
├── backend/                # Express API server
│   ├── src/
│   │   ├── routes/         # auth, profile, credentials, admin, graph, issuers
│   │   ├── models/         # Mongoose schemas (User, Credential, Issuer)
│   │   ├── middleware/     # JWT authentication
│   │   ├── config/         # Database connection
│   │   └── scripts/        # Database seed script
│   └── .env                # Environment variables
├── blockchain/             # Smart contract
│   ├── contracts/          # ReputationPassport.sol
│   ├── deploy.js           # Deployment script
│   └── hardhat.config.js   # Hardhat configuration
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** v18+ & npm — [download](https://nodejs.org/)
- **MongoDB** — Atlas cloud or local instance
- **MetaMask** (optional) — for real wallet authentication

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

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Application

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
npm run dev

# (Optional) Terminal 3: Start local blockchain
cd blockchain && npx hardhat node
```

### 4. Deploy Smart Contract (Local)

```bash
cd blockchain
npx hardhat compile
npx hardhat run deploy.js --network localhost
```

Copy the deployed contract address into `backend/.env` (`CONTRACT_ADDRESS`).

### 5. Seed Test Data

```bash
cd backend && npm run seed
```

This creates 5 users (one per reputation tier) for visual testing via the **Dev Mode: Mock Wallet Login** on the Auth page.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Production build |
| `cd backend && npm run dev` | Start backend with hot-reload |
| `cd backend && npm run seed` | Seed database with test users |
| `cd blockchain && npx hardhat compile` | Compile smart contract |
| `cd blockchain && npx hardhat node` | Start local blockchain |

---

## License

This project is open-source and available under the [GNU General Public License v3.0](LICENSE.md).
