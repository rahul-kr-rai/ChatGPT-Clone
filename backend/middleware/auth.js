const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // FIXED: Synced fallback secret with server.js
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahul_kumar_rai_secret_key');
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = auth;