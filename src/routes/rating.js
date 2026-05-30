const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST: Kirim rating (Customer)
router.post('/', async (req, res) => {
    try {
        const { order_id, customer_id, teknisi_id, skor, komentar } = req.body;

        const [result] = await pool.query(
            'INSERT INTO Rating (order_id, customer_id, teknisi_id, skor, komentar) VALUES (?, ?, ?, ?, ?)',
            [parseInt(order_id), parseInt(customer_id), parseInt(teknisi_id), parseInt(skor), komentar]
        );

        const [newRating] = await pool.query('SELECT * FROM Rating WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: "Rating berhasil dikirim", data: newRating[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: Lihat rating teknisi tertentu (Public/Customer)
router.get('/teknisi/:id', async (req, res) => {
    try {
        const teknisiId = parseInt(req.params.id);

        const [ratings] = await pool.query(`
            SELECT 
                r.*,
                JSON_OBJECT('name', u.name) AS customer
            FROM Rating r
            JOIN User u ON r.customer_id = u.id
            WHERE r.teknisi_id = ? AND r.is_published = ?
            ORDER BY r.created_at DESC
        `, [teknisiId, 1]);

        const formattedData = ratings.map(rating => ({
            ...rating,
            customer: typeof rating.customer === 'string' ? JSON.parse(rating.customer) : rating.customer
        }));

        res.json({ success: true, data: formattedData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;