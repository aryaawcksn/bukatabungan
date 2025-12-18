import crypto from 'crypto';

// Simple math captcha generator
export const generateMathCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer;
  let question;
  
  switch (operator) {
    case '+':
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
      break;
    case '-':
      // Ensure positive result
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      answer = larger - smaller;
      question = `${larger} - ${smaller}`;
      break;
    case '*':
      // Use smaller numbers for multiplication
      const smallNum1 = Math.floor(Math.random() * 5) + 1;
      const smallNum2 = Math.floor(Math.random() * 5) + 1;
      answer = smallNum1 * smallNum2;
      question = `${smallNum1} × ${smallNum2}`;
      break;
    default:
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
  }
  
  // Generate unique token for this captcha
  const token = crypto.randomBytes(16).toString('hex');
  
  return {
    token,
    question,
    answer: answer.toString()
  };
};

// Store captcha answers temporarily (in production, use Redis)
const captchaStore = new Map();

// Clean up expired captchas every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of captchaStore.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) { // 10 minutes
      captchaStore.delete(token);
    }
  }
}, 10 * 60 * 1000);

export const storeCaptcha = (token, answer) => {
  captchaStore.set(token, {
    answer,
    timestamp: Date.now(),
    attempts: 0
  });
};

export const verifyCaptcha = (token, userAnswer) => {
  const stored = captchaStore.get(token);
  
  if (!stored) {
    return { valid: false, error: 'Captcha expired or invalid' };
  }
  
  // Increment attempts
  stored.attempts++;
  
  // Max 3 attempts per captcha
  if (stored.attempts > 3) {
    captchaStore.delete(token);
    return { valid: false, error: 'Too many attempts' };
  }
  
  // Check if answer is correct
  if (stored.answer === userAnswer.toString().trim()) {
    captchaStore.delete(token); // Remove after successful verification
    return { valid: true };
  }
  
  return { valid: false, error: 'Incorrect answer' };
};

// Rate limiting store
const rateLimitStore = new Map();

// Clean up rate limit data every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.firstAttempt > 60 * 60 * 1000) { // 1 hour
      rateLimitStore.delete(ip);
    }
  }
}, 60 * 60 * 1000);

export const checkRateLimit = (ip, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const key = ip;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  const data = rateLimitStore.get(key);
  
  // Reset if window has passed
  if (now - data.firstAttempt > windowMs) {
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  // Check if limit exceeded
  if (data.attempts >= maxAttempts) {
    const timeLeft = windowMs - (now - data.firstAttempt);
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: Math.ceil(timeLeft / 1000 / 60) // minutes
    };
  }
  
  // Increment attempts
  data.attempts++;
  data.lastAttempt = now;
  
  return { 
    allowed: true, 
    remaining: maxAttempts - data.attempts 
  };
};

// Suspicious activity detection
export const detectSuspiciousActivity = (ip, userAgent) => {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /requests/i,
    /automation/i
  ];
  
  // Check user agent
  if (userAgent && suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    return { suspicious: true, reason: 'Suspicious user agent' };
  }
  
  // Check for rapid requests (basic implementation)
  const key = `activity_${ip}`;
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { requests: [now] });
    return { suspicious: false };
  }
  
  const activity = rateLimitStore.get(key);
  
  // Remove requests older than 1 minute
  activity.requests = activity.requests.filter(time => now - time < 60 * 1000);
  
  // Add current request
  activity.requests.push(now);
  
  // If more than 10 requests in 1 minute, mark as suspicious
  if (activity.requests.length > 10) {
    return { suspicious: true, reason: 'Too many requests' };
  }
  
  return { suspicious: false };
};