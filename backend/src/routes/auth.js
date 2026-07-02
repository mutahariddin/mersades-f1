const router = require('express').Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// ── Strict rate limit for auth endpoints: 10 req / 15 min per IP ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Слишком много попыток входа. Подождите 15 минут.' },
});

// POST /api/auth/register
router.post('/register',
  authLimiter,
  body('name').trim().notEmpty().withMessage('Введите имя'),
  body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { name, email, password } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: 'Email уже используется' });
      const user = await User.create({ name, email, password });
      res.status(201).json({ token: sign(user._id), user: user.toPublic() });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

// POST /api/auth/login
router.post('/login',
  authLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Введите пароль'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }
      res.json({ token: sign(user._id), user: user.toPublic() });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user.toPublic ? req.user.toPublic() : req.user });
});

// PUT /api/auth/me
router.put('/me', authMiddleware,
  body('name').optional().trim().notEmpty().withMessage('Имя не может быть пустым'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { name, avatar } = req.body;
      const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true });
      res.json({ user: user.toPublic() });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

// TEMPORARY: POST /api/auth/setup-admin — setup first admin user
router.post('/setup-admin', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = 'admin';
    await user.save();
    res.json({ message: 'Admin role set', user: user.toPublic() });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
