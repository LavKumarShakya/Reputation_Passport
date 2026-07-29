import mongoose, { Schema, Document } from 'mongoose';

export type LogResult = 'success' | 'failure' | 'skipped' | 'info';

export interface IVerificationLog extends Document {
    submissionId: mongoose.Types.ObjectId;
    step: string;       // e.g. "worker_started", "ocr_extraction", "issuer_check", "github_verify", "ipfs_upload"
    result: LogResult;
    message: string;
    timestamp: Date;
}

const VerificationLogSchema = new Schema<IVerificationLog>({
    submissionId: { type: Schema.Types.ObjectId, ref: 'UserSubmission', required: true, index: true },
    step: { type: String, required: true },
    result: {
        type: String,
        enum: ['success', 'failure', 'skipped', 'info'],
        required: true,
    },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IVerificationLog>('VerificationLog', VerificationLogSchema);
