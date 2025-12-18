const { createCanvas } = require('canvas');
const crypto = require('crypto');

// Store captcha sessions in memory (in production, use Redis)
const captchaSessions = new Map();

// Clean up expired captcha sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of captchaSessions.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) { // 5 minutes
      captchaSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000);

// Generate captcha
exports.generateCaptcha = async (req, res) => {
  try {
    // Generate random code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Generate session ID
    const sessionId = crypto.randomBytes(32).toString('hex');

    // Store captcha code with session ID
    captchaSessions.set(sessionId, {
      code: code.toLowerCase(),
      timestamp: Date.now()
    });

    // Create canvas
    const canvas = createCanvas(140, 50);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw text with rotation
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#1e40af';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = 25 + i * 25;
      const y = canvas.height / 2;
      const rotation = (Math.random() - 0.5) * 0.4;

      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }

    // Add noise dots
    ctx.fillStyle = '#64748b';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        1
      );
    }

    // Convert to base64
    const imageBuffer = canvas.toBuffer('image/png');
    const base64Image = imageBuffer.toString('base64');

    res.json({
      success: true,
      sessionId,
      image: `data:image/png;base64,${base64Image}`
    });
  } catch (error) {
    console.error('Generate captcha error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal generate captcha'
    });
  }
};

// Validate captcha
exports.validateCaptcha = (sessionId, userInput) => {
  const session = captchaSessions.get(sessionId);
  
  if (!session) {
    return false;
  }

  // Check if expired (5 minutes)
  if (Date.now() - session.timestamp > 5 * 60 * 1000) {
    captchaSessions.delete(sessionId);
    return false;
  }

  // Validate code (case-insensitive)
  const isValid = session.code === userInput.toLowerCase();
  
  // Delete session after validation (one-time use)
  captchaSessions.delete(sessionId);
  
  return isValid;
};
