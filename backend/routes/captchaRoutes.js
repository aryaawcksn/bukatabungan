import express from 'express';
import { generateMathCaptcha, storeCaptcha, verifyCaptcha, checkRateLimit, detectSuspiciousActivity } from '../utils/captcha.js';

const router = express.Router();

// Generate new captcha
router.get('/generate', (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Check for suspicious activity
    const suspiciousCheck = detectSuspiciousActivity(ip, userAgent);
    if (suspiciousCheck.suspicious) {
      return res.status(429).json({
        success: false,
        message: 'Suspicious activity detected',
        reason: suspiciousCheck.reason
      });
    }
    
    // Check rate limit
    const rateLimit = checkRateLimit(ip, 20, 15 * 60 * 1000); // 20 requests per 15 minutes
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: `Too many requests. Try again in ${rateLimit.resetTime} minutes.`,
        resetTime: rateLimit.resetTime
      });
    }
    
    const captcha = generateMathCaptcha();
    storeCaptcha(captcha.token, captcha.answer);
    
    res.json({
      success: true,
      data: {
        token: captcha.token,
        question: captcha.question
      }
    });
  } catch (error) {
    console.error('Error generating captcha:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate captcha'
    });
  }
});

// Verify captcha
router.post('/verify', (req, res) => {
  try {
    const { token, answer } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    if (!token || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Token and answer are required'
      });
    }
    
    // Check rate limit for verification attempts
    const rateLimit = checkRateLimit(`verify_${ip}`, 10, 5 * 60 * 1000); // 10 attempts per 5 minutes
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: `Too many verification attempts. Try again in ${rateLimit.resetTime} minutes.`
      });
    }
    
    const verification = verifyCaptcha(token, answer);
    
    if (verification.valid) {
      res.json({
        success: true,
        message: 'Captcha verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: verification.error || 'Invalid captcha'
      });
    }
  } catch (error) {
    console.error('Error verifying captcha:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify captcha'
    });
  }
});

export default router;