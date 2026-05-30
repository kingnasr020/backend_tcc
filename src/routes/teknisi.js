const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST: Pendaftaran Teknisi Baru
router.post('/daftar', async (req, res) => {
    try {
        const { user_id, nik, spesialisasi, alamat, area_kerja } = req.body;

        const [result] = await pool.query(
            'INSERT INTO Technician (user_id, nik, spesialisasi, alamat, area_kerja, status) VALUES (?, ?, ?, ?, ?, ?)',
            [parseInt(user_id), nik, spesialisasi, alamat, area_kerja, 'pending']
        );

        const [newTeknisi] = await pool.query('SELECT * FROM Technician WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: "Pendaftaran teknisi berhasil", data: newTeknisi[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: List Semua Teknisi (Admin) beserta Nama Akun User-nya
router.get('/admin', async (req, res) => {
    try {
        const [technicians] = await pool.query(`
            SELECT 
                t.*,
                JSON_OBJECT('name', u.name) AS user
            FROM Technician t
            JOIN User u ON t.user_id = u.id
        `);

        const formattedData = technicians.map(tech => ({
            ...tech,
            user: typeof tech.user === 'string' ? JSON.parse(tech.user) : tech.user
        }));

        res.json({ success: true, data: formattedData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST: Atur Jadwal Ketersediaan Teknisi sendiri
router.post('/me/jadwal', async (req, res) => {
    try {
        const { teknisi_id, hari, jam_mulai, jam_selesai } = req.body;

        // MySQL tipe TIME menerima string format 'HH:MM:SS' secara langsung
        const [result] = await pool.query(
            'INSERT INTO JadwalKetersediaanTeknisi (teknisi_id, hari, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?)',
            [parseInt(teknisi_id), hari, jam_mulai, jam_selesai]
        );

        const [jadwal] = await pool.query('SELECT * FROM JadwalKetersediaanTeknisi WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: "Jadwal ditambahkan", data: jadwal[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;