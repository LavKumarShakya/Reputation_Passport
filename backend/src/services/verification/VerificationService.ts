import { BaseVerifier } from './BaseVerifier';
import { CertificateVerifier } from './CertificateVerifier';
import { HackathonVerifier } from './HackathonVerifier';
import { OpenSourceVerifier } from './OpenSourceVerifier';
import { SubmissionType } from '../../models/UserSubmission';

/**
 * Factory that selects the appropriate verifier based on submission type.
 * Add new verifier classes here as new types are supported.
 */
export class VerificationService {
    static getVerifier(type: SubmissionType): BaseVerifier {
        switch (type) {
            case 'certificate':
                return new CertificateVerifier();
            case 'hackathon':
                return new HackathonVerifier();
            case 'opensource':
                return new OpenSourceVerifier();
            case 'research':
                // Research papers: treat like certificate verification for now
                return new CertificateVerifier();
            case 'workshop':
                // Workshops: treat like certificate verification
                return new CertificateVerifier();
            case 'competition':
                // Competitions: treat like hackathon verification
                return new HackathonVerifier();
            default:
                throw new Error(`No verifier registered for submission type: ${type}`);
        }
    }
}
