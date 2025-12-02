import express from "express";
import { getUserLogs } from "../controllers/userLogController.js";
import { verifyToken } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/role.js";

const router = express.Router();

// ✅ HANYA ADMIN BISA MELIHAT LOG CABANGNYA SENDIRI
router.get(
  "/user-logs",
  verifyToken,
  authorizeRole("admin"),
  getUserLogs
);

export default router;
