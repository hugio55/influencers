const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3400;
const DATA_FILE = path.join(__dirname, 'data', 'influencers.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'POPOLOGY2026';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Read data from file
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return { settings: { goalReach: 150000000, totalSlots: 50 }, influencers: [] };
    }
}

// Write data to file
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data file:', error);
        return false;
    }
}

// Format followers for display (e.g., 14700000 -> "14.7M")
function formatFollowers(num) {
    if (num >= 1000000) {
        const millions = num / 1000000;
        if (millions >= 10) return `${Math.round(millions)}M`;
        return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    } else if (num >= 1000) {
        const thousands = num / 1000;
        if (thousands >= 100) return `${Math.round(thousands / 10) * 10}K`; // Round to nearest 10K
        return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
    }
    return num.toString();
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Parse follower string to number (e.g., "14.7M" -> 14700000)
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

// API: Get all influencers (public)
app.get('/api/influencers', (req, res) => {
    const data = readData();

    // Calculate stats
    const filledSlots = data.influencers.length;
    const totalReach = data.influencers.reduce((sum, inf) => sum + (inf.followers || 0), 0);

    res.json({
        settings: data.settings,
        stats: {
            filledSlots,
            totalSlots: data.settings.totalSlots,
            currentReach: totalReach,
            currentReachDisplay: formatFollowers(totalReach),
            goalReach: data.settings.goalReach,
            goalReachDisplay: formatFollowers(data.settings.goalReach)
        },
        influencers: data.influencers.map(inf => ({
            ...inf,
            followersDisplay: formatFollowers(inf.followers || 0)
        }))
    });
});

// API: Verify admin password
app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;
    console.log('Login attempt - received password length:', password ? password.length : 0);
    if (password === ADMIN_PASSWORD) {
        console.log('Login successful');
        res.json({ success: true });
    } else {
        console.log('Login failed - password mismatch');
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
});

// Middleware to check admin password
function requireAuth(req, res, next) {
    const password = req.headers['x-admin-password'];
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// Validate URL format
function isValidUrl(str) {
    if (!str || !str.trim()) return true; // Empty is ok
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

// API: Save all influencers (requires auth)
app.post('/api/admin/influencers', requireAuth, (req, res) => {
    const { influencers, settings } = req.body;

    // Validate input
    if (!Array.isArray(influencers)) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    // Process influencers - parse follower counts and sanitize
    const processedInfluencers = influencers.map((inf, index) => {
        const name = (inf.name || '').toString().slice(0, 100); // Max 100 chars
        const category = (inf.category || '').toString().slice(0, 50); // Max 50 chars

        return {
            id: inf.id || Date.now() + index,
            name: name,
            category: category,
            followers: parseFollowers(inf.followers),
            social: {
                instagram: (inf.social?.instagram || '').slice(0, 500),
                tiktok: (inf.social?.tiktok || '').slice(0, 500),
                twitter: (inf.social?.twitter || '').slice(0, 500),
                youtube: (inf.social?.youtube || '').slice(0, 500),
                discord: (inf.social?.discord || '').slice(0, 500),
                website: (inf.social?.website || '').slice(0, 500)
            }
        };
    });

    const data = {
        settings: settings || readData().settings,
        influencers: processedInfluencers
    };

    if (writeData(data)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// API: Update settings (requires auth)
app.post('/api/admin/settings', requireAuth, (req, res) => {
    const { goalReach, totalSlots } = req.body;
    const data = readData();

    if (goalReach !== undefined) {
        data.settings.goalReach = parseFollowers(goalReach);
    }
    if (totalSlots !== undefined) {
        data.settings.totalSlots = parseInt(totalSlots) || 50;
    }

    if (writeData(data)) {
        res.json({ success: true, settings: data.settings });
    } else {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin page: http://localhost:${PORT}/admin`);
});
