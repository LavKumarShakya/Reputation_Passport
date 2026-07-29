import VerificationLog from '../../models/VerificationLog';
import { IUserSubmission } from '../../models/UserSubmission';
import { IUser } from '../../models/User';

export interface VerificationResult {
    verified: boolean;
    confidence: number;
    breakdown: Record<string, number>;
    reason: string;
    evidence: string[];
}

/**
 * Abstract base class for all achievement verifiers.
 * Implement the Strategy Pattern — each verifier handles one submission type.
 */
export abstract class BaseVerifier {
    /**
     * Main verification entrypoint. Must be implemented by each concrete verifier.
     */
    abstract verify(submission: IUserSubmission, user: IUser): Promise<VerificationResult>;

    /**
     * Write a step to the VerificationLog audit trail.
     */
    protected async log(
        submissionId: string,
        step: string,
        result: 'success' | 'failure' | 'skipped' | 'info',
        message: string
    ): Promise<void> {
        try {
            await VerificationLog.create({ submissionId, step, result, message });
        } catch (err) {
            console.error(`[BaseVerifier] Failed to write log for step ${step}:`, err);
        }
    }

    /**
     * Clamp a score to [0, maxPoints] and return it.
     */
    protected clamp(value: number, max: number): number {
        return Math.min(Math.max(value, 0), max);
    }

    /**
     * Sum all values in a breakdown object.
     */
    protected sumBreakdown(breakdown: Record<string, number>): number {
        return Object.values(breakdown).reduce((acc, v) => acc + v, 0);
    }
}
