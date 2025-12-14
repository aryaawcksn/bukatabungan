import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import {
  createPengajuan,
  getAllPengajuan,
  getPengajuanById,
  updatePengajuanStatus,
  getAnalyticsData,
  getAllCabangForAnalytics,
  exportToExcel,
  exportBackup,
  importData,
} from "../controllers/pengajuanController.js";

// Konfigurasi multer untuk import file
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung'), false);
    }
  }
});

const router = express.Router();

// Route kirim form pengajuan (public)
router.post("/", createPengajuan);

// Route ambil semua pengajuan (protected)
router.get("/", verifyToken, getAllPengajuan);

// Route khusus untuk analytics - HARUS SEBELUM /:id (protected)
router.get("/analytics/data", verifyToken, getAnalyticsData);
router.get("/analytics/cabang", verifyToken, getAllCabangForAnalytics);

// Route export/import data - HARUS SEBELUM /:id (protected)
router.get("/export/excel", verifyToken, exportToExcel);
router.get("/export/backup", verifyToken, exportBackup);
router.post("/import", verifyToken, upload.single('file'), importData);

// Route ambil satu pengajuan berdasarkan ID (protected)
router.get("/:id", verifyToken, getPengajuanById);

// Route update status pengajuan (protected)
router.put("/:id", verifyToken, updatePengajuanStatus);

export default router;

