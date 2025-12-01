import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.password,
        u.role,
        u.cabang_id,
        c.nama_cabang
      FROM users u
      LEFT JOIN cabang c ON u.cabang_id = c.id
      WHERE u.username = $1
    `, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username tidak ditemukan"
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password salah"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        cabang_id: user.cabang_id
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        cabang_id: user.cabang_id,
        nama_cabang: user.nama_cabang
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
};


export const register = async (req, res) => {
  try {
    const { username, password, role, cabang_id } = req.body;

    if (!username || !password || !role || !cabang_id) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi"
      });
    }

    // Validasi role
    if (!["admin", "employement"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role tidak valid"
      });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username sudah digunakan"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO users (username, password, role, cabang_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, role, cabang_id
    `, [username, hashedPassword, role, cabang_id]);

    res.json({
      success: true,
      message: "User berhasil didaftarkan",
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
