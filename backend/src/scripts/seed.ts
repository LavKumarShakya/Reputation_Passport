import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Credential from '../models/Credential';
import Issuer from '../models/Issuer';

dotenv.config();

// Data from your existing data/users.json and data/issuers.json
const users = [
    {
        displayName: 'Bronze User', handle: 'bronzenovice', email: 'bronze@example.com',
        walletAddress: '0x1BronzeWalletAddress', reputationScore: 150, tier: 'bronze' as const
    },
    {
        displayName: 'Silver User', handle: 'silverachiever', email: 'silver@example.com',
        walletAddress: '0x2SilverWalletAddress', reputationScore: 400, tier: 'silver' as const
    },
    {
        displayName: 'Gold User', handle: 'goldexpert', email: 'gold@example.com',
        walletAddress: '0x3GoldWalletAddress', reputationScore: 600, tier: 'gold' as const
    },
    {
        displayName: 'Platinum User', handle: 'platinummaster', email: 'platinum@example.com',
        walletAddress: '0x4PlatinumWalletAddress', reputationScore: 800, tier: 'platinum' as const
    },
    {
        displayName: 'Diamond User', handle: 'diamondlegend', email: 'diamond@example.com',
        walletAddress: '0x5DiamondWalletAddress', reputationScore: 950, tier: 'diamond' as const
    },
];

const issuersData = [
    {
        walletAddress: '0xISSUER_WALLET_1', name: 'GDG SRMCEM', type: 'Hackathon Organizer',
        description: 'Google Developer Group at SRMCEM', website: 'https://gdg.community.dev', verified: true
    },
    {
        walletAddress: '0xISSUER_WALLET_2', name: 'Coursera', type: 'Educational Institution',
        description: 'Online learning platform', website: 'https://coursera.org', verified: true
    },
    {
        walletAddress: '0xISSUER_WALLET_3', name: 'GitHub', type: 'Platform',
        description: 'Code hosting platform', website: 'https://github.com', verified: true
    },
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
