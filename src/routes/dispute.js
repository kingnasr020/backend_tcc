const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST: Ajukan komplain (Customer)
router.post('/', async (req, res) => {
    try {
        const { order_id, customer_id, alasan, deskripsi } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO Dispute (order_id, customer_id, alasan, deskripsi, status) VALUES (?, ?, ?, ?, ?)',
            [parseInt(order_id), parseInt(customer_id), alasan, deskripsi, 'open']
        );

        // Ambil data yang baru saja dimasukkan untuk dikembalikan ke respon
        const [newDispute] = await pool.query('SELECT * FROM Dispute WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: "Komplain berhasil diajukan", data: newDispute[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: List semua dispute (Admin) beserta data Customer dan Order Code
router.get('/admin', async (req, res) => {
    try {
        const [disputes] = await pool.query(`
            SELECT 
                d.*, 
                JSON_OBJECT('name', u.name, 'phone', u.phone) AS customer,
                JSON_OBJECT('order_code', o.order_code) AS \`order\`
            FROM Dispute d
            JOIN User u ON d.customer_id = u.id
            JOIN \`Order\` o ON d.order_id = o.id
            ORDER BY d.created_at DESC
        `);

        // Parsing string JSON dari MySQL menjadi objek Javascript kembali
        const formattedData = disputes.map(dispute => ({
            ...dispute,
            customer: typeof dispute.customer === 'string' ? JSON.parse(dispute.customer) : dispute.customer,
            order: typeof dispute.order === 'string' ? JSON.parse(dispute.order) : dispute.order
        }));

        res.json({ success: true, data: formattedData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;