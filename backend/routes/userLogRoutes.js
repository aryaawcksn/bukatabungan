import express from "express";
import { getUserLogs } from "../controllers/userLogController.js";
import { verifyToken } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/role.js";

const router = express.Router();

// ✅ ADMIN CABANG DAN SUPER ADMIN BISA MELIHAT LOG
router.get(
  "/user-logs",
  verifyToken,
  authorizeRole("admin_cabang", "super_admin"),
  getUserLogs
);

export default router;
