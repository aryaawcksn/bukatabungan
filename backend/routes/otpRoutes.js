import express from "express";
import { sendOtpHandler, verifyOtpHandler } from "../controllers/otpController.js";

const router = express.Router();

router.post("/send", sendOtpHandler);
router.post("/verify", verifyOtpHandler);

export default router;
