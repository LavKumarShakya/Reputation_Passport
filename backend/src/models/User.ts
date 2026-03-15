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
    techStack?: Record<string, number>; // Map of technology to weight/bytes
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
    techStack: { type: Map, of: Number, default: {} },
    visibility: {
        certificates: { type: Boolean, default: true },
        repos: { type: Boolean, default: true },
        endorsements: { type: Boolean, default: true },
    },
    verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
