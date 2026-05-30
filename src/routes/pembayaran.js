const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST: Buat Invoice Pembayaran baru
router.post('/', async (req, res) => {
    try {
        const { order_id, customer_id, jumlah, metode } = req.body;

        const [result] = await pool.query(
            'INSERT INTO Payment (order_id, customer_id, jumlah, metode, status) VALUES (?, ?, ?, ?, ?)',
            [parseInt(order_id), parseInt(customer_id), jumlah, metode, 'pending']
        );

        const [newPayment] = await pool.query('SELECT * FROM Payment WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: "Invoice pembayaran dibuat", data: newPayment[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT: Konfirmasi Pembayaran Selesai
router.put('/:id/confirm', async (req, res) => {
    try {
        const paymentId = parseInt(req.params.id);
        const sekarang = new Date();

        await pool.query(
            'UPDATE Payment SET status = ?, paid_at = ? WHERE id = ?',
            ['paid', sekarang, paymentId]
        );

        const [updatedPayment] = await pool.query('SELECT * FROM Payment WHERE id = ?', [paymentId]);

        res.json({ success: true, message: "Pembayaran dikonfirmasi", data: updatedPayment[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;