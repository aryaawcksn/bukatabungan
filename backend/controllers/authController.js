import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { logUserActivity } from "../utils/userLogger.js";

/* =========================
   LOGIN
========================= */
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

    // ✅ LOG LOGIN
    await logUserActivity({
      userId: user.id,
      performedBy: user.id,
      cabangId: user.cabang_id,
      action: "LOGIN",
      description: `${user.username} login`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

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

/* =========================
   REGISTER USER (ADMIN)
========================= */
export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk menambahkan user"
      });
    }

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi"
      });
    }

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

    // ✅ FIX: cabang pasti ikut admin yang membuat
    const cabangIdFinal = req.user.cabang_id;

    const result = await pool.query(`
      INSERT INTO users (username, password, role, cabang_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, role, cabang_id
    `, [username, hashedPassword, role, cabangIdFinal]);

    const newUser = result.rows[0];

    await logUserActivity({
      userId: newUser.id,
      performedBy: req.user.id,
      cabangId: cabangIdFinal,
      action: "CREATE_USER",
      description: `${newUser.username} didaftarkan`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({
      success: true,
      message: "User berhasil didaftarkan",
      user: newUser
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =========================
   GET USERS (PER CABANG)
========================= */
export const getUsers = async (req, res) => {
  try {
    const { cabang_id } = req.user;

    let query = `
      SELECT 
        u.id,
        u.username,
        u.role,
        u.cabang_id,
        c.nama_cabang
      FROM users u
      LEFT JOIN cabang c ON u.cabang_id = c.id
      WHERE u.cabang_id = $1
      ORDER BY u.id ASC
    `;

    const result = await pool.query(query, [cabang_id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data user"
    });
  }
};

/* =========================
   UPDATE USER
========================= */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;
  const adminCabangId = req.user.cabang_id;

  try {
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND cabang_id = $2",
      [id, adminCabangId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan atau Anda tidak memiliki akses"
      });
    }

    let query = "UPDATE users SET username = $1, role = $2";
    let params = [username, role];
    let paramIndex = 3;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = $${paramIndex}`;
      params.push(hashedPassword);
      paramIndex++;
    }

    query += ` WHERE id = $${paramIndex} RETURNING id, username, role, cabang_id`;
    params.push(id);

    const result = await pool.query(query, params);

    // ✅ LOG UPDATE
    await logUserActivity({
      userId: id,
      performedBy: req.user.id,
      cabangId: adminCabangId,
      action: "UPDATE_USER",
      description: `mengupdate user ${result.rows[0].username}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({
      success: true,
      message: "User berhasil diupdate",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate user"
    });
  }
};

/* =========================
   DELETE USER
========================= */
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const adminCabangId = req.user.cabang_id;

  try {
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: "Tidak dapat menghapus akun sendiri"
      });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 AND cabang_id = $2 RETURNING id, username",
      [id, adminCabangId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan atau Anda tidak memiliki akses"
      });
    }

    // ✅ LOG DELETE
    await logUserActivity({
      userId: id,
      performedBy: req.user.id,
      cabangId: adminCabangId,
      action: "DELETE_USER",
      description: `Admin menghapus user ${result.rows[0].username}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({
      success: true,
      message: "User berhasil dihapus"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus user"
    });
  }
};
