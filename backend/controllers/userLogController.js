import pool from "../config/db.js";

// ✅ Ambil log berdasarkan role - super admin lihat semua, admin cabang lihat cabangnya
export const getUserLogs = async (req, res) => {
  try {
    const { cabang_id: adminCabangId, role: adminRole } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
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
    `;

    let queryParams = [];
    
    if (adminRole === "super") {
      // Super admin can see all logs
      query += " ORDER BY ul.created_at DESC LIMIT $1 OFFSET $2";
      queryParams = [limit, offset];
    } else {
      // Admin cabang can only see logs from their branch
      query += " WHERE ul.cabang_id = $1 ORDER BY ul.created_at DESC LIMIT $2 OFFSET $3";
      queryParams = [adminCabangId, limit, offset];
    }

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: result.rows,
      page,
      limit
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil user log"
    });
  }
};
