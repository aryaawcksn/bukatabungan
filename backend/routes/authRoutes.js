import express from "express";
import { login, logout, getMe, register, getUsers, updateUser, deleteUser } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/role.js";

const router = express.Router();

import { loginLimiter } from "../middleware/rateLimit.js";

// ✅ SEMUA ROLE BOLEH LOGIN
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe);

// ✅ ADMIN CABANG DAN SUPER ADMIN BOLEH REGISTER USER
router.post(
  "/register",
  verifyToken,
  authorizeRole("admin_cabang", "super_admin"),
  register
);

// ✅ CRUD USERS (ADMIN CABANG DAN SUPER ADMIN)
router.get(
  "/users",
  verifyToken,
  authorizeRole("admin_cabang", "super_admin"),
  getUsers
);

router.put(
  "/users/:id",
  verifyToken,
  authorizeRole("admin_cabang", "super_admin"),
  updateUser
);

router.delete(
  "/users/:id",
  verifyToken,
  authorizeRole("admin_cabang", "super_admin"),
  deleteUser
);

export default router;
