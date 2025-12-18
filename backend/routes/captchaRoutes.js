const express = require('express');
const router = express.Router();
const captchaController = require('../controllers/captchaController');

// Generate captcha
router.get('/generate', captchaController.generateCaptcha);

module.exports = router;