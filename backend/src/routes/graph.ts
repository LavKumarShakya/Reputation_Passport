import { Router, Request, Response } from 'express';
import Credential from '../models/Credential';
import User from '../models/User';
import axios from 'axios';

const router = Router();

// GET /api/graph/:identifier — Get graph nodes/edges (supports wallet, ID, or handle)
router.get('/:identifier', async (req: Request, res: Response) => {
    try {
        const identifier = req.params.identifier as string;
        console.log(`[GRAPH] Request received for: ${identifier}`);
        
        let user = null;
        if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
            user = await User.findById(identifier);
        }
        if (!user) user = await User.findOne({ walletAddress: identifier });
        if (!user) user = await User.findOne({ handle: identifier });

        if (!user) {
            console.log(`[GRAPH] User not found for: ${identifier}`);
            res.status(404).json({ error: 'User not found' });
            return;
        }

        console.log(`[GRAPH] Found user: ${user.handle}, TechStack Size: ${user.techStack ? (user.techStack as any).size || Object.keys(user.techStack).length : 0}`);

        // --- DEEP TECH STACK BACKFILL (If missing or empty) ---
        const isTechStackEmpty = !user.techStack || (user.techStack instanceof Map ? user.techStack.size === 0 : Object.keys(user.techStack).length === 0);
        
        if (isTechStackEmpty) {
            const githubProvider = user.connectedProviders?.github;
            const token = githubProvider?.accessToken;
            const username = githubProvider?.username;

            if (username) {
                console.log(`[GRAPH] Triggering scan for: ${username}. Token: ${token ? 'YES' : 'NO (Public Fallback)'}`);
                try {
                    const headers: any = { 'Accept': 'application/vnd.github.v3+json' };
                    if (token) headers.Authorization = `Bearer ${token}`;

                    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
                    const repos = reposResponse.data;
                    const newTechStack: Record<string, number> = {};
                    const popularFrameworks = ['react', 'node', 'nextjs', 'vue', 'angular', 'express', 'tailwind', 'bootstrap', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'aws', 'firebase', 'flutter', 'react-native', 'ethers', 'web3', 'solidity', 'hardhat', 'truffle', 'typescript', 'javascript'];
                    
                    for (const repo of repos) {
                        if (repo.language) newTechStack[repo.language] = (newTechStack[repo.language] || 0) + 50;
                        if (repo.topics && Array.isArray(repo.topics)) {
                            repo.topics.forEach((t: string) => {
                                const topic = t.toLowerCase();
                                if (popularFrameworks.includes(topic)) newTechStack[topic] = (newTechStack[topic] || 0) + 70;
                                else newTechStack[topic] = (newTechStack[topic] || 0) + 10;
                            });
                        }
                        // Only try manifests if we have a token (otherwise rate limits hit hard)
                        if (token && repos.indexOf(repo) < 5 && (repo.language === 'TypeScript' || repo.language === 'JavaScript')) {
                            try {
                                const pkgResponse = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/contents/package.json`, {
                                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3.raw' }
                                });
                                const pkg = typeof pkgResponse.data === 'string' ? JSON.parse(pkgResponse.data) : pkgResponse.data;
                                const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
                                Object.keys(deps).forEach(d => {
                                    const dep = d.replace(/^@/, '').split('/')[0].toLowerCase();
                                    if (popularFrameworks.includes(dep)) newTechStack[dep] = (newTechStack[dep] || 0) + 100;
                                });
                            } catch (e) {}
                        }
                    }
                    console.log(`[GRAPH] Scan complete. New Skills found: ${Object.keys(newTechStack).length}`);
                    await User.findByIdAndUpdate(user._id, { $set: { techStack: newTechStack } });
                    user.techStack = newTechStack as any;
                } catch (err: any) {
                    console.error(`[GRAPH] Scan failed: ${err.message}`);
                }
            } else {
                console.log(`[GRAPH] No GitHub username found for backfill.`);
            }
        }

        const credentials = await Credential.find({ $or: [{ userWallet: user.walletAddress }, { userId: user._id }] });
        const nodes: any[] = credentials.map(c => ({
            id: c._id.toString(),
            label: (c.data as any).event || (c.data as any).course || (c.data as any).achievement || c.category,
            type: c.category.toLowerCase().includes('hackathon') ? 'hackathon' : c.category.toLowerCase().includes('certificate') ? 'certificate' : 'project',
            value: c.verified ? 80 : 40,
            color: c.verified ? '#22C55E' : '#6B7280',
        }));

        const edges: any[] = nodes.map(n => ({ source: 'center', target: n.id, weight: n.value > 60 ? 4 : 2 }));

        const popularSet = new Set(['react', 'node', 'nextjs', 'vue', 'angular', 'express', 'svelte', 'tailwind', 'bootstrap', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'aws', 'firebase', 'flutter', 'react-native', 'solidity', 'typescript', 'javascript', 'ethers', 'web3', 'hardhat', 'truffle', 'go', 'python', 'rust', 'html', 'css', 'sass', 'graphql', 'apollo', 'prisma', 'supabase']);
        
        if (user.techStack) {
            // Mongoose Maps need to be converted to plain objects for Object.entries to work
            const techStackObj = user.techStack instanceof Map 
                ? Object.fromEntries(user.techStack.entries()) 
                : (user.techStack as any).toObject ? (user.techStack as any).toObject() : user.techStack;

            Object.entries(techStackObj).forEach(([tech, weight]: [string, any]) => {
                const isPopular = popularSet.has(tech.toLowerCase());
                nodes.push({
                    id: `skill-${tech}`,
                    label: tech,
                    type: 'skill',
                    value: Math.min(weight, 100),
                    color: '#3B82F6',
                    popular: isPopular
                });
                edges.push({ source: 'center', target: `skill-${tech}`, weight: Math.min(Math.floor(weight / 20), 5) });
            });
        }

        nodes.unshift({ id: 'center', label: user.displayName || 'You', type: 'user', value: 100, color: '#F97316' });
        res.json({ nodes, edges });
    } catch (error) {
        console.error('[GRAPH] Error:', error);
        res.status(500).json({ error: 'Failed to generate graph data' });
    }
});

export default router;
