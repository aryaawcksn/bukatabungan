import express from 'express';
import { generateCaptcha } from '../controllers/captchaController.js';

const router = express.Router();

// Generate captcha
router.get('/generate', generateCaptcha);

export default router;