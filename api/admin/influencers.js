const https = require('https');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'POPOLOGY2026';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'hugio55/influencers';
const GITHUB_FILE_PATH = 'public/data/influencers.json';
const GITHUB_BRANCH = 'main';

// Parse follower string to number
function parseFollowers(str) {
    if (typeof str === 'number') return str;
    const cleaned = str.toString().replace(/,/g, '').trim().toUpperCase();
    const match = cleaned.match(/^([\d.]+)\s*([KMB]?)$/);
    if (!match) {
        const numOnly = parseFloat(cleaned);
        return isNaN(numOnly) ? 0 : numOnly;
    }
    const num = parseFloat(match[1]);
    const suffix = match[2];
    switch (suffix) {
        case 'K': return Math.round(num * 1000);
        case 'M': return Math.round(num * 1000000);
        case 'B': return Math.round(num * 1000000000);
        default: return Math.round(num);
    }
}

// GitHub API helper
function githubRequest(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
        if (!GITHUB_TOKEN) {
            return reject(new Error('GITHUB_TOKEN not configured'));
        }

        const options = {
            hostname: 'api.github.com',
            path: endpoint,
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'PopologyAdmin',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(parsed.message || `GitHub API error: ${res.statusCode}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check auth
    const password = req.headers['x-admin-password'];
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { influencers, settings } = req.body;

    if (!Array.isArray(influencers)) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    // Process influencers
    const processedInfluencers = influencers.map((inf, index) => ({
        id: inf.id || Date.now() + index,
        name: (inf.name || '').toString().slice(0, 100),
        category: (inf.category || '').toString().slice(0, 50),
        followers: parseFollowers(inf.followers),
        social: {
            instagram: (inf.social?.instagram || '').slice(0, 500),
            tiktok: (inf.social?.tiktok || '').slice(0, 500),
            twitter: (inf.social?.twitter || '').slice(0, 500),
            youtube: (inf.social?.youtube || '').slice(0, 500),
            discord: (inf.social?.discord || '').slice(0, 500),
            website: (inf.social?.website || '').slice(0, 500)
        }
    }));

    const data = {
        settings: settings || { goalReach: 150000000, totalSlots: 50 },
        influencers: processedInfluencers
    };

    // Commit to GitHub (only persistence option on Vercel)
    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'GITHUB_TOKEN not configured - cannot save' });
    }

    try {
        // Get current file SHA
        const currentFile = await githubRequest(
            'GET',
            `/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`
        );

        // Update file
        const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
        await githubRequest(
            'PUT',
            `/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
            {
                message: 'Update influencers via admin panel',
                content: content,
                sha: currentFile.sha,
                branch: GITHUB_BRANCH
            }
        );

        res.status(200).json({
            success: true,
            message: 'Saved! Site will redeploy in ~30 seconds.'
        });
    } catch (error) {
        console.error('GitHub commit failed:', error.message);
        res.status(500).json({ error: 'Failed to save: ' + error.message });
    }
};
