const express = require("express");
const router = express.Router();

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

    res.status(500).json({
      success: false,
      message: err.message,
    });
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
      return res.status(404).json({
        success: false,
        message: "Teknisi tidak ditemukan",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// UPDATE STATUS TEKNISI
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    await db.query(
      `
      UPDATE teknisi
      SET status = ?
      WHERE id = ?
    `,
      [status, req.params.id]
    );

    res.json({
      success: true,
      message: "Status teknisi berhasil diperbarui",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE TEKNISI
router.delete("/:id", async (req, res) => {
  try {
    await db.query(
      `
      DELETE FROM teknisi
      WHERE id = ?
    `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Teknisi berhasil dihapus",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;