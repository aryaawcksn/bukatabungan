import pool from "../config/db.js";
import { sendEmailNotification } from "../services/emailService.js";
import { sendWhatsAppNotification } from "../services/whatsappService.js";
import { logUserActivity } from "./userLogController.js";

// In-memory progress store (in production, use Redis or database)
const importProgressStore = new Map();

/**
 * Update import progress
 */
const updateImportProgress = (sessionId, progress, message) => {
  importProgressStore.set(sessionId, {
    progress: Math.min(100, Math.max(0, progress)),
    message,
    timestamp: new Date()
  });
  // Progress tracking (removed verbose logging)
};

/**
 * Get import progress
 */
export const getImportProgress = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = importProgressStore.get(sessionId);

    if (!progress) {
      return res.json({
        progress: 0,
        message: 'Session tidak ditemukan'
      });
    }

    res.json(progress);
  } catch (err) {
    console.error('❌ Get progress error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil progress'
    });
  }
};

/**
 * Helper function to convert empty strings to null
 * This is needed because PostgreSQL doesn't accept empty strings for date/numeric fields
 */
const emptyToNull = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};