import pool from "../config/db.js";

// ✅ Ambil log berdasarkan cabang admin
export const getUserLogs = async (req, res) => {
  try {
    const adminCabangId = req.user.cabang_id;

    const result = await pool.query(`
      SELECT 
        ul.id,
        ul.action,
        ul.description,
        ul.ip_address,
        ul.user_agent,
        ul.created_at,

        u.username AS target_username,
        a.username AS performed_by,

        c.nama_cabang

      FROM user_log ul
      LEFT JOIN users u ON ul.user_id = u.id
      LEFT JOIN users a ON ul.performed_by = a.id
      LEFT JOIN cabang c ON ul.cabang_id = c.id

      WHERE ul.cabang_id = $1
      ORDER BY ul.created_at DESC
    `, [adminCabangId]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil user log"
    });
  }
};
