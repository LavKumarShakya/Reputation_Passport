import mongoose, { Schema, Document } from 'mongoose';

export type SubmissionType =
    | 'certificate'
    | 'hackathon'
    | 'research'
    | 'opensource'
    | 'workshop'
    | 'competition';

export type SubmissionStatus =
    | 'pending'
    | 'processing'
    | 'verified'
    | 'rejected'
    | 'temp_failed';

export interface IUserSubmission extends Document {
    userId: mongoose.Types.ObjectId;
    type: SubmissionType;
    title: string;
    issuer: string;
    verificationUrl?: string;
    tempFilePath?: string;       // Local disk path BEFORE successful verification
    originalFileName?: string;
    originalFileMime?: string;
    ipfsHash?: string;           // Set AFTER successful verification + IPFS upload
    status: SubmissionStatus;
    confidence?: number;         // 0–100 final composite score
    confidenceBreakdown?: Record<string, number>; // e.g. { ocr: 20, issuer: 20, verificationUrl: 40, certificateId: 12 }
    verificationMessage?: string;
    reputationPoints?: number;
    metadata: Record<string, any>; // Type-specific extra fields
    attempts: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserSubmissionSchema = new Schema<IUserSubmission>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        enum: ['certificate', 'hackathon', 'research', 'opensource', 'workshop', 'competition'],
        required: true,
    },
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    verificationUrl: { type: String },
    tempFilePath: { type: String },
    originalFileName: { type: String },
    originalFileMime: { type: String },
    ipfsHash: { type: String },
    status: {
        type: String,
        enum: ['pending', 'processing', 'verified', 'rejected', 'temp_failed'],
        default: 'pending',
        index: true,
    },
    confidence: { type: Number, min: 0, max: 100 },
    confidenceBreakdown: { type: Schema.Types.Mixed },
    verificationMessage: { type: String },
    reputationPoints: { type: Number },
    metadata: { type: Schema.Types.Mixed, default: {} },
    attempts: { type: Number, default: 0 },
}, { timestamps: true });

// Prevent exact duplicate submissions (same user + title + issuer + type)
UserSubmissionSchema.index({ userId: 1, title: 1, issuer: 1, type: 1 }, { unique: true });

export default mongoose.model<IUserSubmission>('UserSubmission', UserSubmissionSchema);
