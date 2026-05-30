const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET: Ambil semua layanan aktif
router.get('/', async (req, res) => {
    try {
        const [layanan] = await pool.query('SELECT * FROM Service WHERE is_active = ?', [1]);
        res.json({ success: true, data: layanan });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST: Tambah layanan baru (Admin)
router.post('/admin', async (req, res) => {
    try {
        const { nama, kategori, deskripsi, harga_minimum, harga_maksimum, durasi_estimasi_jam } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO Service (nama, kategori, deskripsi, harga_minimum, harga_maksimum, durasi_estimasi_jam) VALUES (?, ?, ?, ?, ?, ?)',
            [nama, kategori, deskripsi, harga_minimum, harga_maksimum, durasi_estimasi_jam]
        );

        const [newService] = await pool.query('SELECT * FROM Service WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: "Layanan berhasil ditambahkan", data: newService[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;