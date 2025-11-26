import express from "express";
import { getAllCabang, updateCabangStatus } from "../controllers/cabangController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllCabang);
router.put("/:id/status", verifyToken, updateCabangStatus);

export default router;
