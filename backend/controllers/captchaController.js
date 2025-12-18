import crypto from 'crypto';

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

// Generate simple math captcha
export const generateCaptcha = async (req, res) => {
  try {
    // Generate simple math problem
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
    }

    // Generate session ID
    const sessionId = crypto.randomBytes(32).toString('hex');

    // Store captcha answer with session ID
    captchaSessions.set(sessionId, {
      code: answer.toString(),
      timestamp: Date.now()
    });

    res.json({
      success: true,
      sessionId,
      question: question,
      message: 'Selesaikan perhitungan berikut'
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
export const validateCaptcha = (sessionId, userInput) => {
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
