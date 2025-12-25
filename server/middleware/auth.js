const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // 1. Get token from the Authorization header (Format: "Bearer TOKEN")
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');
    
    // 3. Attach user ID to the request object so routes can use it
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = auth;