const express = require("express");
const router = express.Router();

const db = require("../db");

const { authenticate } = require("../middleware/auth");
const admin = require("../middleware/admin");

router.use(authenticate);
router.use(admin);

// GET ALL DISPUTE
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM disputes
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

// RESOLVE DISPUTE
router.put("/:id/resolve", async (req, res) => {
  try {
    const { resolusi } = req.body;

    await db.query(
      `
      UPDATE disputes
      SET
        status = 'resolved',
        resolusi = ?,
        resolved_at = NOW()
      WHERE id = ?
    `,
      [resolusi, req.params.id]
    );

    res.json({
      success: true,
      message: "Dispute berhasil diselesaikan",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// REJECT DISPUTE
router.put("/:id/reject", async (req, res) => {
  try {
    await db.query(
      `
      UPDATE disputes
      SET status = 'rejected'
      WHERE id = ?
    `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Dispute berhasil ditolak",
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