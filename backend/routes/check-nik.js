import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/check-nik", async (req, res) => {
  const { nik } = req.query;

  const cek = await pool.query(
    "SELECT id FROM pengajuan_tabungan WHERE nik = $1 LIMIT 1",
    [nik]
  );

  res.json({ exists: cek.rows.length > 0 });
});

export default router;
