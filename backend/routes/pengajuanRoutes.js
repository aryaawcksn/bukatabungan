import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import { requireCaptcha, checkCaptchaRequired, enhancedRateLimit } from "../middleware/captchaMiddleware.js";
import {
  createPengajuan,
  getAllPengajuan,
  getPengajuanById,
  updatePengajuanStatus,
  getAnalyticsData,
  getAllCabangForAnalytics,
  exportToExcel,
  exportBackup,
  previewImportData,
  importData,
  getImportProgress,
  deleteDataByStatus,
  editSubmission,
  getEditHistory,
  getStatusByReferenceCode,
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

// Route kirim form pengajuan (public) - dengan captcha protection
router.post("/", enhancedRateLimit(3, 10 * 60 * 1000), requireCaptcha, createPengajuan);

// Route cek status berdasarkan kode referensi (public) - dengan rate limiting
router.get("/status/:referenceCode", enhancedRateLimit(10, 5 * 60 * 1000), getStatusByReferenceCode);

// Route ambil semua pengajuan (protected)
router.get("/", verifyToken, getAllPengajuan);

// Route khusus untuk analytics - HARUS SEBELUM /:id (protected)
router.get("/analytics/data", verifyToken, getAnalyticsData);
router.get("/analytics/cabang", verifyToken, getAllCabangForAnalytics);

// Route export/import data - HARUS SEBELUM /:id (protected)
router.get("/export/excel", verifyToken, exportToExcel);
router.get("/export/backup", verifyToken, exportBackup);
router.post("/import/preview", verifyToken, upload.single('file'), previewImportData);
router.post("/import", verifyToken, upload.single('file'), importData);
router.get("/import/progress/:sessionId", verifyToken, getImportProgress);

// Route delete data - HARUS SEBELUM /:id (protected)
router.delete("/delete/:status", verifyToken, deleteDataByStatus);

// Route edit submission - HARUS SEBELUM /:id (protected)
router.put("/:id/edit", verifyToken, editSubmission);
router.get("/:id/history", verifyToken, getEditHistory);

// Route ambil satu pengajuan berdasarkan ID (protected)
router.get("/:id", verifyToken, getPengajuanById);

// Route update status pengajuan (protected)
router.put("/:id", verifyToken, updatePengajuanStatus);

export default router;

