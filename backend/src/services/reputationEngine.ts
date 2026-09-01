import User from '../models/User';
import { IUserSubmission, SubmissionType } from '../models/UserSubmission';

// Base reputation points per submission type
const BASE_POINTS: Record<string, number> = {
    certificate: 20,
    hackathon: 40,           // participation; bumped for winners based on metadata
    hackathon_winner: 100,
    research: 80,
    opensource: 30,
    workshop: 15,
    competition: 50,
};

const TIER_THRESHOLDS: Array<{ min: number; tier: string }> = [
    { min: 900,  tier: 'diamond' },
    { min: 700,  tier: 'platinum' },
    { min: 500,  tier: 'gold' },
    { min: 300,  tier: 'silver' },
    { min: 0,    tier: 'bronze' },
];

/**
 * Calculate final reputation points for a verified submission.
 * Applies confidence multiplier: finalPoints = base * (confidence / 100)
 */
export function calculateReputationPoints(submission: IUserSubmission): number {
    const isWinner = !!submission.metadata?.isWinner;
    const typeKey = submission.type === 'hackathon' && isWinner ? 'hackathon_winner' : submission.type;
    const base = BASE_POINTS[typeKey] ?? 10;
    const confidence = submission.confidence ?? 50;
    return Math.round(base * (confidence / 100));
}

/**
 * Apply reputation points to a user and recalculate their tier.
 * Single responsibility: this is the only place reputation changes.
 */
export async function applyReputation(
    userId: string,
    submission: IUserSubmission
): Promise<{ pointsAwarded: number; newScore: number; newTier: string }> {
    const points = calculateReputationPoints(submission);

    const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { reputationScore: points } },
        { new: true }
    );

    if (!user) throw new Error(`User ${userId} not found when applying reputation`);

    // Recalculate tier based on new score
    const newTier = TIER_THRESHOLDS.find(t => user.reputationScore >= t.min)?.tier ?? 'bronze';

    if (user.tier !== newTier) {
        await User.findByIdAndUpdate(userId, { tier: newTier });
        user.tier = newTier as any;
    }

    console.log(
        `[ReputationEngine] User ${userId}: +${points} pts → ${user.reputationScore} total (${newTier})`
    );

    return { pointsAwarded: points, newScore: user.reputationScore, newTier };
}

/**
 * Revoke reputation points from a user (e.g., when a verified submission is deleted) and recalculate their tier.
 */
export async function revokeReputation(
    userId: string,
    submission: IUserSubmission
): Promise<{ pointsRevoked: number; newScore: number; newTier: string }> {
    const points = submission.reputationPoints || calculateReputationPoints(submission);
    
    // Make sure score doesn't drop below zero
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) throw new Error(`User ${userId} not found when revoking reputation`);

    const newScoreRaw = userToUpdate.reputationScore - points;
    const finalScore = Math.max(0, newScoreRaw);

    const user = await User.findByIdAndUpdate(
        userId,
        { reputationScore: finalScore },
        { new: true }
    );

    if (!user) throw new Error(`User ${userId} not found when revoking reputation (update phase)`);

    // Recalculate tier based on new score
    const newTier = TIER_THRESHOLDS.find(t => user.reputationScore >= t.min)?.tier ?? 'bronze';

    if (user.tier !== newTier) {
        await User.findByIdAndUpdate(userId, { tier: newTier });
        user.tier = newTier as any;
    }

    console.log(
        `[ReputationEngine] User ${userId}: -${points} pts → ${user.reputationScore} total (${newTier})`
    );

    return { pointsRevoked: points, newScore: user.reputationScore, newTier };
}
