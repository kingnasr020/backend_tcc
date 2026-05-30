const express = require("express");
const router = express.Router();

const db = require("../db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.use(auth);
router.use(admin);

// RINGKASAN
router.get("/ringkasan", async (req, res) => {
  try {
    const [[order]] = await db.query(
      `SELECT COUNT(*) total FROM orders`
    );

    const [[teknisi]] = await db.query(
      `SELECT COUNT(*) total FROM teknisi`
    );

    const [[revenue]] = await db.query(`
      SELECT IFNULL(SUM(jumlah),0) total
      FROM pembayaran
      WHERE status='paid'
    `);

    res.json({
      total_order: order.total,
      total_teknisi: teknisi.total,
      total_revenue: revenue.total,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// REVENUE
router.get("/revenue", async (req, res) => {
  try {
    const [[data]] = await db.query(`
      SELECT IFNULL(SUM(jumlah),0) total
      FROM pembayaran
      WHERE status='paid'
    `);

    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;