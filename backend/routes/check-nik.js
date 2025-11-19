import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/check-nik", async (req, res) => {
  try {
    const { nik, email, phone } = req.query;

    if (nik) {
      const cek = await pool.query(
        "SELECT status FROM pengajuan_tabungan WHERE nik = $1 LIMIT 1",
        [nik]
      );
      if (cek.rows.length > 0) {
        const status = cek.rows[0].status;
        const relevant = ['pending', 'accepted'];
        return res.json({ exists: relevant.includes(status), status });
      }
      return res.json({ exists: false, status: null });
    }

    if (email) {
      const cek = await pool.query(
        "SELECT id FROM pengajuan_tabungan WHERE email = $1 LIMIT 1",
        [email]
      );
      return res.json({ exists: cek.rows.length > 0 });
    }

    if (phone) {
      const cek = await pool.query(
        "SELECT id FROM pengajuan_tabungan WHERE no_hp = $1 LIMIT 1",
        [phone]
      );
      return res.json({ exists: cek.rows.length > 0 });
    }

    // If no recognized query provided
    return res.status(400).json({ success: false, message: 'Query parameter required: nik, email, or phone' });
  } catch (err) {
    console.error('check-nik error', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
