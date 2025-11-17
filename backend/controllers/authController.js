import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

/**
 * Login admin
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM admin WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Username tidak ditemukan" });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password salah" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, cabang: admin.cabang },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        cabang: admin.cabang,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

/**
 * Register admin baru
 */
export const register = async (req, res) => {
  try {
    const { username, password, cabang } = req.body;

    if (!username || !password || !cabang) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }

    // Cek apakah username sudah ada
    const existing = await pool.query("SELECT * FROM admin WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username sudah digunakan" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    const result = await pool.query(
      "INSERT INTO admin (username, password, cabang) VALUES ($1, $2, $3) RETURNING id, username, cabang",
      [username, hashedPassword, cabang]
    );

    res.json({ success: true, message: "Admin berhasil didaftarkan", admin: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

