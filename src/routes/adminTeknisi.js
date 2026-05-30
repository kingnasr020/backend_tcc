const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Wajib ditambahkan untuk hash password

const db = require("../db");

const { authenticate } = require("../middleware/auth");
const admin = require("../middleware/admin");

router.use(authenticate);
router.use(admin);

// GET ALL TEKNISI
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        t.id,
        t.user_id,
        t.nik,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.created_at
      FROM Technician t
      JOIN User u
        ON u.id = t.user_id
      ORDER BY t.id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: TAMBAH TEKNISI BARU OLEH ADMIN (AMAN UNTUK PRODUKSI)
router.post("/", async (req, res) => {
  // Gunakan koneksi transaksi agar jika ada error, database tidak corrupt
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { name, email, phone, password, nik, spesialisasi, alamat, area_kerja } = req.body;

    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 2. Buat akun User terlebih dahulu
    const [userResult] = await connection.query(
      'INSERT INTO User (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, password_hash, 'teknisi'] 
    );

    const newUserId = userResult.insertId;

    // 3. Buat profil Technician menyambung ke user_id baru
    await connection.query(
      'INSERT INTO Technician (user_id, nik, spesialisasi, alamat, area_kerja, status) VALUES (?, ?, ?, ?, ?, ?)',
      [newUserId, nik, spesialisasi, alamat, area_kerja, 'active'] 
    );

    // Commit jika semua query berhasil
    await connection.commit();

    res.status(201).json({ 
      success: true, 
      message: "Akun dan profil teknisi berhasil dibuat" 
    });
  } catch (err) {
    // Rollback jika gagal (misal email duplikat)
    await connection.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
});

// GET DETAIL TEKNISI
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        t.id,
        t.user_id,
        t.nik,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.created_at
      FROM Technician t
      JOIN User u
        ON u.id = t.user_id
      WHERE t.id = ?
      `,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Teknisi tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE STATUS TEKNISI
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    await db.query(
      `
      UPDATE Technician
      SET status = ?
      WHERE id = ?
    `,
      [status, req.params.id]
    );

    res.json({ success: true, message: "Status teknisi berhasil diperbarui" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE TEKNISI
router.delete("/:id", async (req, res) => {
  try {
    await db.query(
      `
      DELETE FROM Technician
      WHERE id = ?
    `,
      [req.params.id]
    );

    res.json({ success: true, message: "Teknisi berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;