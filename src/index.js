const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Koneksi database
const pool = require('./db');

const app = express();

// =========================
// ROUTES
// =========================
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/order');
const layananRoutes = require('./routes/layanan');
const teknisiRoutes = require('./routes/teknisi');
const pembayaranRoutes = require('./routes/pembayaran');
const disputeRoutes = require('./routes/dispute');
const ratingRoutes = require('./routes/rating');
const laporanRoutes = require('./routes/laporan');

// ADMIN ROUTES
const adminTeknisiRoutes = require('./routes/adminTeknisi');
const adminOrderRoutes = require('./routes/adminOrder');
const adminDisputeRoutes = require('./routes/adminDispute');

const PORT = process.env.PORT || 8080;

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// PUBLIC ROUTES
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/order', orderRoutes);
app.use('/api/layanan', layananRoutes);
app.use('/api/teknisi', teknisiRoutes);

app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/dispute', disputeRoutes);
app.use('/api/rating', ratingRoutes);

// =========================
// ADMIN ROUTES
// =========================
app.use('/api/admin/laporan', laporanRoutes);

app.use('/api/admin/teknisi', adminTeknisiRoutes);

app.use('/api/admin/orders', adminOrderRoutes);

app.use('/api/admin/dispute', adminDisputeRoutes);

// =========================
// ROOT ENDPOINT
// =========================
app.get('/', (req, res) => {
    res.json({
        message: 'API Marketplace Jasa Servis Panggilan Sempurna!',
        status: 'Active'
    });
});

// =========================
// TEST DATABASE
// =========================
app.get('/api/tes-db', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT COUNT(*) AS total FROM User'
        );

        const totalUsers = rows[0].total;

        res.json({
            success: true,
            message:
                'Koneksi SQL Murni (mysql2) ke Google Cloud SQL Berhasil!',
            total_user_di_database: totalUsers
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =========================
// 404 HANDLER
// =========================
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

// =========================
// SERVER START
// =========================
app.listen(PORT, '0.0.0.0', () => {
    console.log('=======================================================');
    console.log(`🚀 SERVER UTUH AKTIF DI: http://0.0.0.0:${PORT}`);
    console.log('=======================================================');
});