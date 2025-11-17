// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id };  // ✅ Changed from payload.userId to payload.id
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};
