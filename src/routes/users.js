const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

// GET: Ambil profil sendiri (wajib pakai Bearer Token di Header)
router.get('/me', authenticate, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, name, email, phone, role, avatar_url FROM User WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        res.json({ success: true, data: users[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT: Update profil sendiri
router.put('/me', authenticate, async (req, res) => {
    try {
        const { name, phone, avatar_url } = req.body;

        await pool.query(
            'UPDATE User SET name = ?, phone = ?, avatar_url = ? WHERE id = ?',
            [name, phone, avatar_url, req.user.id]
        );

        const [updatedUsers] = await pool.query(
            'SELECT id, name, email, phone, role, avatar_url FROM User WHERE id = ?',
            [req.user.id]
        );

        res.json({ success: true, message: "Profil diperbarui", data: updatedUsers[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET ALL USERS (ADMIN)
router.get('/', authenticate, async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT
                id,
                name,
                email,
                phone,
                role,
                avatar_url,
                created_at
            FROM User
            ORDER BY created_at DESC
        `);

        res.json(users);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;