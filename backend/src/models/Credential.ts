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
