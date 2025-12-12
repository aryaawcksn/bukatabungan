import jwt from "jsonwebtoken";


import pool from "../config/db.js";

export const verifyToken = async (req, res, next) => {
  const sessionToken = req.cookies.session_token;

  if (!sessionToken) {
    return res.status(401).json({ success: false, message: "Unauthorized: No session token" });
  }

  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.username, u.role, u.cabang_id,
        s.expired_at
      FROM auth_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = $1
    `, [sessionToken]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid session" });
    }

    const session = result.rows[0];

    if (new Date() > new Date(session.expired_at)) {
      await pool.query("DELETE FROM auth_sessions WHERE session_token = $1", [sessionToken]);
      return res.status(401).json({ success: false, message: "Session expired" });
    }

    req.user = session;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const optionalVerifyToken = async (req, res, next) => {
  const sessionToken = req.cookies.session_token;

  if (!sessionToken) {
    return next();
  }

  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.username, u.role, u.cabang_id,
        s.expired_at
      FROM auth_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = $1
    `, [sessionToken]);

    if (result.rows.length > 0) {
      const session = result.rows[0];
      if (new Date() <= new Date(session.expired_at)) {
        req.user = session;
      }
    }
    next();
  } catch (err) {
    console.error("Optional Auth Middleware Error:", err);
    next();
  }
};

