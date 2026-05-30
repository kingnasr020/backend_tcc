const express = require("express");
const router = express.Router();

const db = require("../db");

const { authenticate } = require("../middleware/auth");
const admin = require("../middleware/admin");

router.use(authenticate);
router.use(admin);

// GET ALL ORDERS
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM orders
      ORDER BY created_at DESC
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

// GET ORDER STATS
router.get("/stats", async (req, res) => {
  try {
    const [[total]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM orders
    `);

    const [[pending]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE status = 'pending'
    `);

    const [[completed]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE status = 'completed'
    `);

    const [[cancelled]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE status = 'cancelled'
    `);

    res.json({
      success: true,
      data: {
        total: total.total,
        pending: pending.total,
        completed: completed.total,
        cancelled: cancelled.total,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ASSIGN TEKNISI
router.put("/:id/assign-teknisi", async (req, res) => {
  try {
    const { teknisi_id } = req.body;

    await db.query(
      `
      UPDATE orders
      SET teknisi_id = ?
      WHERE id = ?
    `,
      [teknisi_id, req.params.id]
    );

    res.json({
      success: true,
      message: "Teknisi berhasil ditugaskan",
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