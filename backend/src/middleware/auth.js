const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Requires valid JWT ──
const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'Пользователь не найден' });
    next();
  } catch {
    res.status(401).json({ error: 'Токен недействителен' });
  }
};

// ── Requires role=admin ──
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  next();
};

module.exports = authMiddleware;
module.exports.adminOnly = adminOnly;
