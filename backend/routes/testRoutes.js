import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Route test koneksi database
router.get("/cek-koneksi", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

