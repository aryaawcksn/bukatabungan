import pool from "../db.js"; // koneksi postgres kamu

export async function logUserActivity({
  userId = null,
  performedBy = null,
  cabangId,
  action,
  description,
  ipAddress,
  userAgent
}) {
  try {
    await pool.query(
      `
      INSERT INTO user_log 
      (user_id, performed_by, cabang_id, action, description, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        userId,
        performedBy,
        cabangId,
        action,
        description,
        ipAddress,
        userAgent
      ]
    );
  } catch (err) {
    console.error("Gagal insert user_log:", err.message);
  }
}
