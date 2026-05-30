const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Impor pool koneksi mysql2
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'scribble_secret_key_2026';

// 1. ENDPOINT REGISTER CUSTOMER & ADMIN
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Cek apakah email sudah terdaftar
        const [existingUsers] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: "Email sudah terdaftar!" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const userRole = role || 'customer';

        // Insert user baru ke database
        const [result] = await pool.query(
            'INSERT INTO User (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, passwordHash, userRole]
        );

        res.status(201).json({ success: true, message: "Registrasi berhasil!", userId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. ENDPOINT LOGIN MULTI-ROLE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email
        const [users] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password salah!" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            success: true,
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;