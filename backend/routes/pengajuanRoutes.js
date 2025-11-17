import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createPengajuan,
  getAllPengajuan,
  getPengajuanById,
  updatePengajuanStatus,
} from "../controllers/pengajuanController.js";

const router = express.Router();

// Route kirim form pengajuan (public)
router.post("/", createPengajuan);

// Route ambil semua pengajuan (protected)
router.get("/", verifyToken, getAllPengajuan);

// Route ambil satu pengajuan berdasarkan ID (protected)
router.get("/:id", verifyToken, getPengajuanById);

// Route update status pengajuan (protected)
router.put("/:id", verifyToken, updatePengajuanStatus);

export default router;

