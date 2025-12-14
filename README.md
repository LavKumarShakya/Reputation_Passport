# Reputation Project

Reputation Project is a decentralized reputation verification platform that transforms academic and professional achievements into tamper-proof, verifiable digital proof.

Instead of relying on resumes, PDFs, or screenshots, user credentials such as certificates, GitHub activity, and event participation are hashed and stored on blockchain. Any verifier—recruiter, institution, or organizer—can independently verify authenticity without trusting the platform or the user.

Each user is issued a dynamic NFT-based reputation passport that evolves as new achievements are added. The NFT reflects real-time reputation growth while preserving privacy by storing only cryptographic hashes on-chain.

Reputation Project eliminates credential fraud, reduces manual verification, and introduces a trustless reputation layer for students and professionals.

## Tech Stack

### Frontend

- **React.js** – component-based UI, fast rendering
- **Tailwind CSS** – clean, consistent design system
- **Framer Motion** – subtle UI animations
- **Chart.js / D3.js** – reputation score & growth visualization
- **Wallet Connect / MetaMask** – blockchain identity connection

### Backend (Lightweight, Intentional)

- **Client-side JSON / IndexedDB** – temporary credential data storage
- **Node.js (optional, minimal)** – hashing & request handling
  (Only if judges ask — core logic is frontend-driven)

### Blockchain

- **Ethereum / Polygon (Testnet)** – low cost, fast transactions
- **Solidity Smart Contracts**
  - Store hashed credentials
  - Maintain reputation score mapping
- **Keccak-256 / SHA-256** – cryptographic hashing
- **Dynamic NFT (ERC-721)** – reputation passport
- **IPFS** – off-chain metadata storage (NFT metadata)

### Dev & Tools

- **Hardhat** – smart contract development & testing
- **Ethers.js** – blockchain interaction
- **Git & GitHub** – version control
- **Vercel / Netlify** – deployment

## Development Process

### 1️⃣ Design & UI Planning

We used AI tools to accelerate UI/UX design decisions.

- Generated multiple layout ideas for dashboards and reputation views
- Refined typography, spacing, and component hierarchy
- Iterated faster on dark-mode, trust-focused visual design

👉 **Impact:** Reduced design iteration time and improved visual clarity.

---

### 2️⃣ Code Assistance & Debugging

AI tools were used as pair programmers, not as code generators.

- Helped scaffold React components
- Assisted in writing Solidity smart contract boilerplate
- Debugged wallet connection and transaction handling
- Optimized hashing and verification logic

👉 **Impact:** Faster development with fewer logical errors.

---

### 3️⃣ Blockchain Logic Validation

We used AI to validate architecture decisions, not replace them.

- Compared on-chain vs off-chain storage tradeoffs
- Verified correctness of hashing + verification flow
- Reviewed smart contract security patterns (read-only verification, no raw data storage)

👉 **Impact:** Prevented poor blockchain design choices early.

---

### 4️⃣ Content & Presentation

AI helped in non-code but critical areas:

- Structuring project pitch and demo flow
- Simplifying blockchain explanation for non-technical judges
- Writing concise documentation and presentation scripts

👉 **Impact:** Clearer communication and stronger demo delivery.

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js & npm installed - [download node.js](https://nodejs.org/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/LavKumarShakya/Reputation_Passport.git
   cd Reputation_Passport
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the app for production.
- `npm run lint` - Runs ESLint to check for code quality issues.
- `npm run preview` - Previews the production build locally.

## License

This project is open-source and available under the GNU General Public License v3.0.
