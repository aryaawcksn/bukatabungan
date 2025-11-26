import express from "express";
import { getAllCabang, updateCabangStatus } from "../controllers/cabangController.js";
import { authenticateToken } from "../middleware/authMiddleware.js"; // Assuming this exists

const router = express.Router();

// Public route to fetch branches (needed for AccountForm)
router.get("/", getAllCabang);

// Protected route to update status
router.put("/:id/status", authenticateToken, updateCabangStatus);

export default router;
