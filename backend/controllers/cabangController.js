import pool from "../config/db.js";

/**
 * Get all branches
 * Query params: active=true (optional) to filter only active branches
 */
export const getAllCabang = async (req, res) => {
  try {
    const { active } = req.query;
    // Jika request dari authenticated user (misal admin cabang), filter cabang
    const userCabangId = req.user?.cabang_id;

    let query = "SELECT * FROM cabang";
    const values = [];
    let whereClauses = [];

    if (active === 'true') {
      whereClauses.push("is_active = true");
    }

    // Only filter by cabang_id if user is not super admin
    const userRole = req.user?.role;
    if (userCabangId && userRole !== 'super') {
      whereClauses.push(`id = $${values.length + 1}`);
      values.push(userCabangId);
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY id ASC";

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching branches:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data cabang" });
  }
};



/**
 * Update branch status (is_active)
 * Protected: Admin only
 */
export const updateCabangStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // ✅ Ambil user dari JWT / auth middleware
    const userName = req.user?.username || "Unknown";

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "Status harus boolean"
      });
    }

    const query = `
      UPDATE cabang 
      SET 
        is_active = $1,
        updated_by = $2
      WHERE id = $3 
      RETURNING *
    `;

    const result = await pool.query(query, [
      is_active,
      userName,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cabang tidak ditemukan"
      });
    }

    res.json({
      success: true,
      message: "Status cabang berhasil diperbarui",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("Error updating branch status:", err);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui status cabang"
    });
  }
};



