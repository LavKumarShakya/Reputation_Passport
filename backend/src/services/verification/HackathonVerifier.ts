import axios from 'axios';
import fs from 'fs';
import { BaseVerifier, VerificationResult } from './BaseVerifier';
import { IUserSubmission } from '../../models/UserSubmission';
import { IUser } from '../../models/User';

export class HackathonVerifier extends BaseVerifier {
    async verify(submission: IUserSubmission, user: IUser): Promise<VerificationResult> {
        const sid = submission._id.toString();
        const breakdown: Record<string, number> = {
            github_repo_exists: 0,
            user_is_contributor: 0,
            repo_created_before_deadline: 0,
            winner_page_name_match: 0,
            certificate_ocr_match: 0,
        };
        const evidence: string[] = [];

        await this.log(sid, 'hackathon_verification_start', 'info', `Starting hackathon verification for: ${submission.title}`);

        const githubRepoUrl: string = submission.metadata?.githubRepoUrl || '';
        const winnerUrl: string = submission.metadata?.winnerUrl || '';
        const hackathonYear: number = parseInt(submission.metadata?.year || new Date().getFullYear());
        const githubToken = (user.connectedProviders as any)?.github?.accessToken;
        const githubUsername = (user.connectedProviders as any)?.github?.username;

        // ── Step 1: Parse GitHub repo URL ─────────────────────────────────
        let repoOwner = '', repoName = '';
        if (githubRepoUrl) {
            const match = githubRepoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
            if (match) {
                repoOwner = match[1];
                repoName = match[2].replace(/\.git$/, '');
            }
        }

        // ── Step 2: Check GitHub repo exists ──────────────────────────────
        if (repoOwner && repoName) {
            try {
                const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' };
                if (githubToken) headers['Authorization'] = `Bearer ${githubToken}`;

                const repoRes = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
                    headers,
                    timeout: 10_000,
                });
                const repo = repoRes.data;

                breakdown.github_repo_exists = 20;
                evidence.push(`GitHub repository "${repoOwner}/${repoName}" exists`);
                await this.log(sid, 'github_repo_check', 'success', `Repo exists: ${repo.html_url}`);

                // ── Step 3: Repo created before hackathon deadline ─────────────
                const repoCreated = new Date(repo.created_at).getFullYear();
                if (repoCreated <= hackathonYear) {
                    breakdown.repo_created_before_deadline = 10;
                    evidence.push(`Repository created in ${repoCreated} (hackathon year: ${hackathonYear})`);
                    await this.log(sid, 'repo_age_check', 'success', `Repo created in ${repoCreated}, hackathon year ${hackathonYear}`);
                } else {
                    await this.log(sid, 'repo_age_check', 'failure', `Repo created in ${repoCreated}, after hackathon year ${hackathonYear}`);
                }

                // ── Step 4: Check user is a contributor ───────────────────────
                if (githubUsername) {
                    try {
                        const contribRes = await axios.get(
                            `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
                            { headers, timeout: 10_000 }
                        );
                        const contributors: Array<{ login: string }> = contribRes.data || [];
                        const isContributor = contributors.some(
                            c => c.login.toLowerCase() === githubUsername.toLowerCase()
                        );

                        if (isContributor) {
                            breakdown.user_is_contributor = 30;
                            evidence.push(`GitHub user "${githubUsername}" is a contributor`);
                            await this.log(sid, 'contributor_check', 'success', `User "${githubUsername}" verified as contributor`);
                        } else {
                            await this.log(sid, 'contributor_check', 'failure', `User "${githubUsername}" not found in contributors list`);
                        }
                    } catch (contribErr: any) {
                        await this.log(sid, 'contributor_check', 'failure', `Contributor check failed: ${contribErr.message}`);
                        if (contribErr.code === 'ETIMEDOUT' || contribErr.code === 'ECONNREFUSED') throw contribErr;
                    }
                } else {
                    await this.log(sid, 'contributor_check', 'skipped', 'No GitHub account connected');
                }

            } catch (repoErr: any) {
                if (repoErr.response?.status === 404) {
                    await this.log(sid, 'github_repo_check', 'failure', `Repository "${repoOwner}/${repoName}" not found on GitHub`);
                } else {
                    await this.log(sid, 'github_repo_check', 'failure', `GitHub API error: ${repoErr.message}`);
                    if (repoErr.code === 'ETIMEDOUT' || repoErr.code === 'ECONNREFUSED') throw repoErr;
                }
            }
        } else {
            await this.log(sid, 'github_repo_check', 'skipped', 'No GitHub repository URL provided');
        }

        // ── Step 5: Winner / project page check ───────────────────────────
        if (winnerUrl) {
            try {
                const winnerRes = await axios.get(winnerUrl, {
                    timeout: 10_000,
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AuraPassportBot/1.0)' },
                    validateStatus: s => s < 500,
                });
                const bodyLower = (typeof winnerRes.data === 'string'
                    ? winnerRes.data
                    : JSON.stringify(winnerRes.data)).toLowerCase();

                const userName = (user.displayName || githubUsername || '').toLowerCase();
                const projectName = (submission.metadata?.projectName || '').toLowerCase();

                if (userName && bodyLower.includes(userName)) {
                    breakdown.winner_page_name_match = 25;
                    evidence.push(`User name found on winner/project page`);
                    await this.log(sid, 'winner_page_check', 'success', 'User name matched on winner page');
                } else if (projectName && bodyLower.includes(projectName)) {
                    breakdown.winner_page_name_match = 15;
                    evidence.push(`Project name "${submission.metadata?.projectName}" found on winner page`);
                    await this.log(sid, 'winner_page_check', 'success', 'Project name matched on winner page');
                } else {
                    await this.log(sid, 'winner_page_check', 'failure', 'Neither user name nor project name found on winner page');
                }
            } catch (winnerErr: any) {
                await this.log(sid, 'winner_page_check', 'failure', `Winner page fetch failed: ${winnerErr.message}`);
                if (winnerErr.code === 'ETIMEDOUT' || winnerErr.code === 'ECONNREFUSED') throw winnerErr;
            }
        } else {
            await this.log(sid, 'winner_page_check', 'skipped', 'No winner URL provided');
        }

        // ── Step 6: Certificate OCR (if file provided) ─────────────────────
        if (submission.tempFilePath && fs.existsSync(submission.tempFilePath)) {
            try {
                let text = '';
                const mime = submission.originalFileMime || '';
                if (mime === 'application/pdf' || submission.tempFilePath.endsWith('.pdf')) {
                    const pdfParse = require('pdf-parse');
                    const data = await pdfParse(fs.readFileSync(submission.tempFilePath));
                    text = data.text || '';
                } else {
                    const Tesseract = require('tesseract.js');
                    const result = await Tesseract.recognize(submission.tempFilePath, 'eng', { logger: () => {} });
                    text = result.data.text || '';
                }

                const textLower = text.toLowerCase();
                const hackathonName = (submission.title || '').toLowerCase();
                if (hackathonName && textLower.includes(hackathonName.split(' ')[0])) {
                    breakdown.certificate_ocr_match = 15;
                    evidence.push('Hackathon name found in certificate text');
                    await this.log(sid, 'certificate_ocr', 'success', 'Hackathon name matched in OCR text');
                } else {
                    await this.log(sid, 'certificate_ocr', 'failure', 'Hackathon name not found in certificate text');
                }
            } catch (ocrErr: any) {
                await this.log(sid, 'certificate_ocr', 'failure', `OCR failed: ${ocrErr.message}`);
            }
        } else {
            await this.log(sid, 'certificate_ocr', 'skipped', 'No certificate file provided');
        }

        // ── Step 7: Final Score ────────────────────────────────────────────
        const confidence = this.clamp(this.sumBreakdown(breakdown), 100);

        // Hackathon verified if confidence >= 60 AND hard evidence exists (repo exists + basic match)
        const hasHardEvidence = breakdown.github_repo_exists > 0 && (breakdown.user_is_contributor > 0 || breakdown.winner_page_name_match > 0);
        const verified = confidence >= 51 && hasHardEvidence;
        
        const reason = verified
            ? `Hackathon participation verified with ${confidence}% confidence`
            : `Insufficient evidence — confidence ${confidence}%. ${hasHardEvidence ? '' : 'No hard evidence found (repo + contributor/winner match).'}`;

        await this.log(sid, 'confidence_calculated', verified ? 'success' : 'failure',
            `Final confidence: ${confidence}/100 — ${verified ? 'VERIFIED' : 'REJECTED'}`);

        return { verified, confidence, breakdown, reason, evidence };
    }
}
