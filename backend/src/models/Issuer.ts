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
