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

// ✅ ADMIN DAN SUPER ADMIN BOLEH REGISTER USER
router.post(
  "/register",
  verifyToken,
  authorizeRole("admin", "super"),
  register
);

// ✅ CRUD USERS (ADMIN DAN SUPER ADMIN)
router.get(
  "/users",
  verifyToken,
  authorizeRole("admin", "super"),
  getUsers
);

router.put(
  "/users/:id",
  verifyToken,
  authorizeRole("admin", "super"),
  updateUser
);

router.delete(
  "/users/:id",
  verifyToken,
  authorizeRole("admin", "super"),
  deleteUser
);

export default router;
