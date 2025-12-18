import { verifyCaptcha, checkRateLimit, detectSuspiciousActivity } from '../utils/captcha.js';

// Middleware to verify captcha for protected routes
export const requireCaptcha = (req, res, next) => {
  try {
    const { captchaToken, captchaAnswer } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Check for suspicious activity
    const suspiciousCheck = detectSuspiciousActivity(ip, userAgent);
    if (suspiciousCheck.suspicious) {
      return res.status(429).json({
        success: false,
        message: 'Akses ditolak karena aktivitas mencurigakan',
        requireCaptcha: true
      });
    }
    
    // Check if captcha is provided
    if (!captchaToken || !captchaAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Captcha diperlukan untuk melanjutkan',
        requireCaptcha: true
      });
    }
    
    // Verify captcha
    const verification = verifyCaptcha(captchaToken, captchaAnswer);
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.error === 'Incorrect answer' 
          ? 'Jawaban captcha salah' 
          : 'Captcha tidak valid atau sudah kedaluwarsa',
        requireCaptcha: true
      });
    }
    
    // Captcha verified, continue to next middleware
    next();
  } catch (error) {
    console.error('Captcha middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memverifikasi captcha',
      requireCaptcha: true
    });
  }
};

// Middleware to check if captcha is needed based on rate limiting
export const checkCaptchaRequired = (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Always check for suspicious activity
    const suspiciousCheck = detectSuspiciousActivity(ip, userAgent);
    if (suspiciousCheck.suspicious) {
      req.requireCaptcha = true;
      return next();
    }
    
    // Check rate limit (more lenient for checking)
    const rateLimit = checkRateLimit(`check_${ip}`, 3, 5 * 60 * 1000); // 3 attempts per 5 minutes
    
    if (!rateLimit.allowed) {
      req.requireCaptcha = true;
    } else {
      req.requireCaptcha = false;
    }
    
    next();
  } catch (error) {
    console.error('Check captcha middleware error:', error);
    req.requireCaptcha = true; // Default to requiring captcha on error
    next();
  }
};

// Enhanced rate limiting middleware
export const enhancedRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const rateLimit = checkRateLimit(ip, maxAttempts, windowMs);
      
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          message: `Terlalu banyak percobaan. Coba lagi dalam ${rateLimit.resetTime} menit.`,
          resetTime: rateLimit.resetTime,
          requireCaptcha: true
        });
      }
      
      // Add rate limit info to response headers
      res.set({
        'X-RateLimit-Limit': maxAttempts,
        'X-RateLimit-Remaining': rateLimit.remaining,
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });
      
      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next(); // Continue on error, but log it
    }
  };
};