import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/check-nik", async (req, res) => {
  try {
    const { no_id, email, phone } = req.query;

    if (no_id) {
      const cek = await pool.query(
        `SELECT p.status 
         FROM cdd_self c
         JOIN pengajuan_tabungan p ON c.pengajuan_id = p.id
         WHERE c.no_id = $1 
         LIMIT 1`,
        [no_id]
      );
      if (cek.rows.length > 0) {
        const status = cek.rows[0].status;

        // blok hanya jika pending atau accepted
        const blocked = ['pending', 'approved'].includes(status);

        return res.json({ exists: blocked, status });
      }

      return res.json({ exists: false, status: null });
    }

    if (email) {
      const cek = await pool.query(
        "SELECT pengajuan_id FROM cdd_self WHERE email = $1 LIMIT 1",
        [email]
      );
      return res.json({ exists: cek.rows.length > 0 });
    }

    if (phone) {
      const cek = await pool.query(
        "SELECT pengajuan_id FROM cdd_self WHERE no_hp = $1 LIMIT 1",
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
