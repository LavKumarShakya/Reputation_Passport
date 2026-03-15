import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    earnedAt: Date;
    type: string;
    metadata?: any;
}

const AchievementSchema = new Schema<IAchievement>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    rarity: { 
        type: String, 
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], 
        default: 'common' 
    },
    earnedAt: { type: Date, default: Date.now },
    type: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Ensure a user doesn't get the same achievement type multiple times
AchievementSchema.index({ userId: 1, type: 1 }, { unique: true });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
