import express from "express";
import { getAllCabang, updateCabangStatus } from "../controllers/cabangController.js";
import { verifyToken, optionalVerifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", optionalVerifyToken, getAllCabang);
router.put("/:id/status", verifyToken, updateCabangStatus);

export default router;
