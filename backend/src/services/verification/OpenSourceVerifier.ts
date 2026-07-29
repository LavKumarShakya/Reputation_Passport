import axios from 'axios';
import { BaseVerifier, VerificationResult } from './BaseVerifier';
import { IUserSubmission } from '../../models/UserSubmission';
import { IUser } from '../../models/User';

export class OpenSourceVerifier extends BaseVerifier {
    async verify(submission: IUserSubmission, user: IUser): Promise<VerificationResult> {
        const sid = submission._id.toString();
        const breakdown: Record<string, number> = {
            repo_exists: 0,
            user_is_contributor: 0,
            commit_count: 0,
            pull_requests: 0,
            repo_popularity: 0,
        };
        const evidence: string[] = [];

        await this.log(sid, 'opensource_verification_start', 'info', `Starting open-source verification for: ${submission.title}`);

        const repoUrl: string = submission.metadata?.repoUrl || submission.verificationUrl || '';
        const githubToken = (user.connectedProviders as any)?.github?.accessToken;
        const githubUsername = (user.connectedProviders as any)?.github?.username;

        // Parse GitHub URL
        let repoOwner = '', repoName = '';
        if (repoUrl) {
            const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
            if (match) {
                repoOwner = match[1];
                repoName = match[2].replace(/\.git$/, '');
            }
        }

        if (!repoOwner || !repoName) {
            await this.log(sid, 'repo_check', 'failure', 'Could not parse GitHub repository URL');
            return {
                verified: false,
                confidence: 0,
                breakdown,
                reason: 'Invalid or missing GitHub repository URL',
                evidence,
            };
        }

        const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' };
        if (githubToken) headers['Authorization'] = `Bearer ${githubToken}`;

        // ── Step 1: Repo exists ────────────────────────────────────────────
        let repo: any = null;
        try {
            const repoRes = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
                headers, timeout: 10_000,
            });
            repo = repoRes.data;
            breakdown.repo_exists = 20;
            evidence.push(`Repository "${repoOwner}/${repoName}" exists`);
            await this.log(sid, 'repo_check', 'success', `Repo exists with ${repo.stargazers_count} stars`);

            // ── Step 5: Popularity ─────────────────────────────────────────────
            if (repo.stargazers_count >= 100) {
                breakdown.repo_popularity = 10;
                evidence.push(`Repository has ${repo.stargazers_count} stars`);
            }
        } catch (err: any) {
            if (err.response?.status === 404) {
                await this.log(sid, 'repo_check', 'failure', 'Repository not found on GitHub');
            } else {
                await this.log(sid, 'repo_check', 'failure', `GitHub API error: ${err.message}`);
                if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') throw err;
            }

            return { verified: false, confidence: 0, breakdown, reason: 'GitHub repository not found', evidence };
        }

        if (!githubUsername) {
            await this.log(sid, 'contributor_check', 'skipped', 'No GitHub account connected to profile');
        } else {
            // ── Step 2: User is contributor ───────────────────────────────────
            try {
                const contribRes = await axios.get(
                    `https://api.github.com/repos/${repoOwner}/${repoName}/contributors?per_page=100`,
                    { headers, timeout: 10_000 }
                );
                const contributors: Array<{ login: string; contributions: number }> = contribRes.data || [];
                const userContrib = contributors.find(c => c.login.toLowerCase() === githubUsername.toLowerCase());

                if (userContrib) {
                    breakdown.user_is_contributor = 30;
                    evidence.push(`GitHub user "${githubUsername}" has ${userContrib.contributions} contributions`);
                    await this.log(sid, 'contributor_check', 'success', `${githubUsername} — ${userContrib.contributions} commits`);

                    // ── Step 3: Commit count bonus ─────────────────────────────────
                    if (userContrib.contributions >= 10) {
                        breakdown.commit_count = 20;
                        evidence.push(`Significant contribution: ${userContrib.contributions} commits`);
                    } else if (userContrib.contributions >= 3) {
                        breakdown.commit_count = 10;
                    }
                } else {
                    await this.log(sid, 'contributor_check', 'failure', `${githubUsername} not in contributors list`);
                }
            } catch (err: any) {
                await this.log(sid, 'contributor_check', 'failure', `Contributor check error: ${err.message}`);
                if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') throw err;
            }

            // ── Step 4: Pull Requests by user ─────────────────────────────────
            try {
                const prRes = await axios.get(
                    `https://api.github.com/search/issues?q=repo:${repoOwner}/${repoName}+type:pr+author:${githubUsername}&per_page=10`,
                    { headers, timeout: 10_000 }
                );
                const prCount = prRes.data?.total_count || 0;
                if (prCount >= 1) {
                    breakdown.pull_requests = 20;
                    evidence.push(`${prCount} pull request(s) by ${githubUsername}`);
                    await this.log(sid, 'pr_check', 'success', `${prCount} PR(s) found`);
                } else {
                    await this.log(sid, 'pr_check', 'skipped', 'No pull requests found');
                }
            } catch (prErr: any) {
                await this.log(sid, 'pr_check', 'skipped', `PR search skipped: ${prErr.message}`);
            }
        }

        const confidence = this.clamp(this.sumBreakdown(breakdown), 100);
        
        // Open Source verified if confidence >= 60 AND hard evidence exists (user is a contributor)
        const hasHardEvidence = breakdown.user_is_contributor > 0;
        const verified = confidence >= 60 && hasHardEvidence;
        
        const reason = verified
            ? `Open source contribution verified with ${confidence}% confidence`
            : `Insufficient contribution evidence — ${confidence}%. ${hasHardEvidence ? '' : 'No hard evidence found (user not verified as a contributor).'}`;

        await this.log(sid, 'confidence_calculated', verified ? 'success' : 'failure',
            `Final confidence: ${confidence}/100`);

        return { verified, confidence, breakdown, reason, evidence };
    }
}
