# Credentials JSON Schema

This file documents the structure for `credentials.json`. Create this file manually if needed.

## File Location
`/data/credentials.json`

## Schema

```json
[
  {
    "userWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "issuerWallet": "0xISSUER_WALLET_1",
    "category": "Hackathon Win",
    "data": {
      "event": "GDG Hackathon",
      "position": "1st",
      "date": "2025-02-10",
      "description": "Won first place in the GDG Hackathon 2025"
    },
    "issuedAt": "2025-02-10T10:00:00Z"
  },
  {
    "userWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "issuerWallet": "0xISSUER_WALLET_2",
    "category": "Certificate",
    "data": {
      "course": "Machine Learning Fundamentals",
      "institution": "Coursera",
      "completionDate": "2024-12-15",
      "grade": "A+"
    },
    "issuedAt": "2024-12-15T14:30:00Z"
  },
  {
    "userWallet": "0x8ba1f109551bD432803012645Hac136c22C3c",
    "issuerWallet": "0xISSUER_WALLET_1",
    "category": "Certificate",
    "data": {
      "course": "Advanced React Development",
      "institution": "Udemy",
      "completionDate": "2024-11-20",
      "grade": "A"
    },
    "issuedAt": "2024-11-20T09:00:00Z"
  },
  {
    "userWallet": "0x8ba1f109551bD432803012645Hac136c22C3c",
    "issuerWallet": "0xISSUER_WALLET_3",
    "category": "Achievement",
    "data": {
      "achievement": "Open Source Contributor",
      "repository": "react/react",
      "contributions": 50,
      "date": "2024-10-01"
    },
    "issuedAt": "2024-10-01T12:00:00Z"
  }
]
```

## Field Descriptions

- `userWallet`: Ethereum address of the credential recipient
- `issuerWallet`: Ethereum address of the issuing institution
- `category`: Type of credential (e.g., "Hackathon Win", "Certificate", "Achievement")
- `data`: Credential-specific data (varies by category)
- `issuedAt`: ISO 8601 timestamp of issuance

## Notes

- The `data` field is hashed using SHA-256 before storing on-chain
- Only the hash is stored on the blockchain, not the raw data
- This file simulates off-chain storage (prototype)
- Production: Replace with IPFS/Arweave or backend database

