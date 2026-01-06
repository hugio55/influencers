const fs = require('fs');
const path = require('path');

// Format followers for display
function formatFollowers(num) {
    if (num >= 1000000) {
        const millions = num / 1000000;
        if (millions >= 10) return `${Math.round(millions)}M`;
        return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    } else if (num >= 1000) {
        const thousands = num / 1000;
        if (thousands >= 100) return `${Math.round(thousands / 10) * 10}K`;
        return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
    }
    return num.toString();
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Read from bundled JSON file
        const dataPath = path.join(process.cwd(), 'public', 'data', 'influencers.json');
        const fileData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(fileData);

        // Calculate stats
        const filledSlots = data.influencers.length;
        const totalReach = data.influencers.reduce((sum, inf) => sum + (inf.followers || 0), 0);

        res.status(200).json({
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
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
};
