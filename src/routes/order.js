const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST: Buat order baru
router.post('/buat', async (req, res) => {
    try {
        const { customer_id, layanan_id, alamat_servis, deskripsi_kerusakan, jadwal_tanggal } = req.body;
        const orderCode = `SCB-${Date.now().toString().slice(-7)}`;
        const sekarang = new Date();

        const [result] = await pool.query(
            'INSERT INTO \`Order\` (order_code, customer_id, layanan_id, alamat_servis, deskripsi_kerusakan, jadwal_tanggal, jadwal_waktu_mulai, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [orderCode, parseInt(customer_id), parseInt(layanan_id), alamat_servis, deskripsi_kerusakan, new Date(jadwal_tanggal), sekarang, 'pending']
        );

        const [newOrder] = await pool.query('SELECT * FROM \`Order\` WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: "Order dibuat!", data: newOrder[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: Ambil antrean order beserta info customer & nama layanan
router.get('/antrean', async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT 
                o.*,
                JSON_OBJECT('name', u.name, 'phone', u.phone) AS customer,
                JSON_OBJECT('nama', s.nama) AS service
            FROM \`Order\` o
            JOIN User u ON o.customer_id = u.id
            JOIN Service s ON o.layanan_id = s.id
            ORDER BY o.created_at DESC
        `);

        const formattedData = orders.map(order => ({
            ...order,
            customer: typeof order.customer === 'string' ? JSON.parse(order.customer) : order.customer,
            service: typeof order.service === 'string' ? JSON.parse(order.service) : order.service
        }));

        res.json({ success: true, data: formattedData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT: Update status order
router.put('/:id/status', async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;

        await pool.query('UPDATE \`Order\` SET status = ? WHERE id = ?', [status, orderId]);
        const [updatedOrder] = await pool.query('SELECT * FROM \`Order\` WHERE id = ?', [orderId]);

        res.json({ success: true, message: "Status diperbarui", data: updatedOrder[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST: Input Diagnosa dari Teknisi
router.post('/:id/diagnosa', async (req, res) => {
    try {
        const { teknisi_id, hasil_diagnosa, tindakan_perbaikan, biaya_jasa, total_biaya } = req.body;
        const orderId = parseInt(req.params.id);

        const [result] = await pool.query(
            'INSERT INTO OrderDiagnosa (order_id, teknisi_id, hasil_diagnosa, tindakan_perbaikan, biaya_jasa, total_biaya) VALUES (?, ?, ?, ?, ?, ?)',
            [orderId, parseInt(teknisi_id), hasil_diagnosa, tindakan_perbaikan, biaya_jasa, total_biaya]
        );

        const [diagnosa] = await pool.query('SELECT * FROM OrderDiagnosa WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: "Diagnosa berhasil disimpan", data: diagnosa[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;