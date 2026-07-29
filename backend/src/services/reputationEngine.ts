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

// Tier thresholds
const TIER_THRESHOLDS: Array<{ min: number; tier: string }> = [
    { min: 1000, tier: 'diamond' },
    { min: 600,  tier: 'platinum' },
    { min: 300,  tier: 'gold' },
    { min: 100,  tier: 'silver' },
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
