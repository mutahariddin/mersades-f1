const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// GET /api/products?category=&sort=&search=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { category, sort, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      // Search both English and Russian names
      filter.$or = [
        { nameRu: { $regex: search, $options: 'i' } },
        { name:   { $regex: search, $options: 'i' } },
      ];
    }
    const sortObj = sort === 'price_asc'  ? { price: 1 }
                  : sort === 'price_desc' ? { price: -1 }
                  : { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Не найдено' });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/products — admin only
router.post('/', authMiddleware, adminOnly,
  body('name').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('image').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const p = await Product.create(req.body);
      res.status(201).json(p);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
);

// PUT /api/products/:id — admin only
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE /api/products/:id — admin only
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Удалено' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
