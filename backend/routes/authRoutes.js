import express from "express";
import { login, register } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/role.js";

const router = express.Router();

// ✅ SEMUA ROLE BOLEH LOGIN
router.post("/login", login);

// ✅ HANYA ADMIN YANG BOLEH REGISTER USER
router.post(
  "/register",
  verifyToken,
  authorizeRole("admin"),
  register
);

export default router;
