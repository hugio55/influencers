const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'POPOLOGY2026';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
};
