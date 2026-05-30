const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET: Ringkasan Dashboard (Admin)
router.get('/ringkasan', async (req, res) => {
    try {
        // Hitung total order (Gunakan backtick karena Order adalah kata cadangan SQL)
        const [orderRows] = await pool.query('SELECT COUNT(*) AS total FROM \`Order\`');
        const totalOrder = orderRows[0].total;

        // Hitung teknisi aktif
        const [teknisiRows] = await pool.query('SELECT COUNT(*) AS total FROM Technician WHERE status = ?', ['aktif']);
        const teknisiAktif = teknisiRows[0].total;

        // Hitung dispute open
        const [disputeRows] = await pool.query('SELECT COUNT(*) AS total FROM Dispute WHERE status = ?', ['open']);
        const disputeOpen = disputeRows[0].total;
        
        res.json({ 
            success: true, 
            data: { 
                total_order: totalOrder, 
                teknisi_aktif: teknisiAktif, 
                dispute_pending: disputeOpen 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;