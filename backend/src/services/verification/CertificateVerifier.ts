import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { BaseVerifier, VerificationResult } from './BaseVerifier';
import { IUserSubmission } from '../../models/UserSubmission';
import { IUser } from '../../models/User';

// Canonical trusted issuers — extend this list freely
const TRUSTED_ISSUERS = [
    'coursera', 'google', 'aws', 'amazon web services', 'cisco',
    'microsoft', 'nptel', 'linkedin learning', 'udemy', 'udacity',
    'edx', 'harvardx', 'mitx', 'ibm', 'oracle', 'comptia',
    'meta', 'salesforce', 'adobe', 'red hat', 'nvidia',
    'freecodecamp', 'hackerrank', 'datacamp', 'pluralsight',
];

export class CertificateVerifier extends BaseVerifier {
    async verify(submission: IUserSubmission, user: IUser): Promise<VerificationResult> {
        const sid = submission._id.toString();
        const breakdown: Record<string, number> = {
            ocr_name_match: 0,
            certificate_id_in_pdf: 0,
            trusted_issuer: 0,
            verification_url: 0,
        };
        const evidence: string[] = [];

        await this.log(sid, 'certificate_verification_start', 'info', `Starting certificate verification for: ${submission.title}`);

        // ── Step 1: OCR / PDF Text Extraction ──────────────────────────────
        let extractedText = '';
        if (submission.tempFilePath && fs.existsSync(submission.tempFilePath)) {
            const mime = submission.originalFileMime || '';

            if (mime === 'application/pdf' || submission.tempFilePath.endsWith('.pdf')) {
                try {
                    // Dynamic import to avoid issues if pdf-parse not yet loaded
                    const pdfParse = require('pdf-parse');
                    const buffer = fs.readFileSync(submission.tempFilePath);
                    const data = await pdfParse(buffer);
                    extractedText = data.text || '';
                    await this.log(sid, 'ocr_extraction', 'success', `PDF parsed — extracted ${extractedText.length} characters`);
                } catch (pdfErr: any) {
                    await this.log(sid, 'ocr_extraction', 'failure', `pdf-parse failed: ${pdfErr.message}`);
                }
            }

            // Fallback: tesseract OCR for image-based certs
            if (!extractedText.trim() && (mime.startsWith('image/') || !mime.includes('pdf'))) {
                try {
                    const Tesseract = require('tesseract.js');
                    const result = await Tesseract.recognize(submission.tempFilePath, 'eng', { logger: () => {} });
                    extractedText = result.data.text || '';
                    await this.log(sid, 'ocr_extraction', 'success', `Tesseract OCR — extracted ${extractedText.length} characters`);
                } catch (ocrErr: any) {
                    await this.log(sid, 'ocr_extraction', 'failure', `Tesseract OCR failed: ${ocrErr.message}`);
                }
            }
        } else {
            await this.log(sid, 'ocr_extraction', 'skipped', 'No file uploaded, skipping OCR');
        }

        const textLower = extractedText.toLowerCase();

        // ── Step 2: Name match in extracted text ───────────────────────────
        const userName = (user.displayName || '').toLowerCase();
        if (userName && textLower.includes(userName)) {
            breakdown.ocr_name_match = 20;
            evidence.push(`Recipient name "${user.displayName}" found in certificate text`);
            await this.log(sid, 'name_match', 'success', `User name matched in OCR text`);
        } else if (extractedText) {
            await this.log(sid, 'name_match', 'failure', 'User name not found in extracted text');
        }

        // ── Step 3: Certificate ID in PDF ──────────────────────────────────
        const certId = (submission.metadata?.certificateId || '').toLowerCase().trim();
        if (certId && textLower.includes(certId)) {
            breakdown.certificate_id_in_pdf = 20;
            evidence.push(`Certificate ID "${submission.metadata.certificateId}" found in document`);
            await this.log(sid, 'certificate_id_check', 'success', 'Certificate ID matched in document text');
        } else if (certId) {
            await this.log(sid, 'certificate_id_check', 'failure', 'Certificate ID not found in document text');
        } else {
            breakdown.certificate_id_in_pdf = 10; // partial credit — no ID provided
            await this.log(sid, 'certificate_id_check', 'skipped', 'No certificate ID provided');
        }

        // ── Step 4: Trusted Issuer Check ───────────────────────────────────
        const issuerLower = submission.issuer.toLowerCase();
        const isTrusted = TRUSTED_ISSUERS.some(ti => issuerLower.includes(ti));
        if (isTrusted) {
            breakdown.trusted_issuer = 20;
            evidence.push(`Issuer "${submission.issuer}" is on the trusted issuers list`);
            await this.log(sid, 'issuer_validation', 'success', `Trusted issuer: ${submission.issuer}`);
        } else {
            await this.log(sid, 'issuer_validation', 'failure', `Issuer "${submission.issuer}" is not in the trusted list`);
        }

        // ── Step 5: Verification URL Check ─────────────────────────────────
        if (submission.verificationUrl) {
            try {
                const response = await axios.get(submission.verificationUrl, {
                    timeout: 10_000,
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AuraPassportBot/1.0)' },
                    validateStatus: (s) => s < 500,
                });
                const bodyLower = (typeof response.data === 'string' ? response.data : JSON.stringify(response.data)).toLowerCase();

                let urlScore = 0;
                if (response.status >= 200 && response.status < 400) {
                    urlScore += 20; // page accessible
                    evidence.push(`Verification URL responded with status ${response.status}`);
                }

                // Check if cert ID or user name appears in the page
                if (certId && bodyLower.includes(certId)) {
                    urlScore += 20;
                    evidence.push('Certificate ID confirmed on verification page');
                } else if (userName && bodyLower.includes(userName)) {
                    urlScore += 20;
                    evidence.push('Recipient name confirmed on verification page');
                }

                breakdown.verification_url = this.clamp(urlScore, 40);
                await this.log(sid, 'url_verification', 'success', `URL check complete — score: ${breakdown.verification_url}/40`);
            } catch (urlErr: any) {
                // Network errors should be retried by BullMQ — rethrow if transient
                if (urlErr.code === 'ECONNREFUSED' || urlErr.code === 'ETIMEDOUT') {
                    await this.log(sid, 'url_verification', 'failure', `Network error (will retry): ${urlErr.message}`);
                    throw urlErr; // triggers BullMQ retry
                }
                await this.log(sid, 'url_verification', 'failure', `URL check failed: ${urlErr.message}`);
            }
        } else {
            await this.log(sid, 'url_verification', 'skipped', 'No verification URL provided');
        }

        // ── Step 6: Final Score ────────────────────────────────────────────
        const confidence = this.clamp(this.sumBreakdown(breakdown), 100);

        // A certificate is "verified" if confidence >= 60 AND it has some actual evidence (OCR match, ID match, or URL content match)
        const hasHardEvidence = breakdown.ocr_name_match > 0 || breakdown.certificate_id_in_pdf === 20 || breakdown.verification_url > 20;
        const verified = confidence >= 60 && hasHardEvidence;
        
        const reason = verified
            ? `Certificate verified with ${confidence}% confidence`
            : `Insufficient evidence — confidence ${confidence}%. ${hasHardEvidence ? '' : 'No hard evidence found (name/ID match in document or URL).'}`;

        await this.log(sid, 'confidence_calculated', verified ? 'success' : 'failure',
            `Final confidence: ${confidence}/100 — ${verified ? 'VERIFIED' : 'REJECTED'}`);

        return { verified, confidence, breakdown, reason, evidence };
    }
}
