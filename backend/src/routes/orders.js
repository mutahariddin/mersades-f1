const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// POST /api/orders — verify prices server-side
router.post('/', async (req, res) => {
  try {
    const { items, customer, userId } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'Корзина пуста' });

    // ── Server-side price verification ──
    const productIds = items.map(i => i.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const priceMap = Object.fromEntries(dbProducts.map(p => [p._id.toString(), p.price]));

    let total = 0;
    const verifiedItems = items.map(item => {
      const dbPrice = priceMap[item.productId];
      if (!dbPrice) throw new Error(`Товар не найден: ${item.productId}`);
      const qty = Math.max(1, Number(item.quantity) || 1);
      total += dbPrice * qty;
      return {
        productId: item.productId,
        name:      item.name,
        price:     dbPrice,      // ← используем цену из БД, не из запроса
        quantity:  qty,
        image:     item.image,
        size:      item.size || null,
      };
    });

    const order = await Order.create({
      items: verifiedItems,
      total: Math.round(total * 100) / 100,
      customer,
      user: userId || null,
    });
    res.status(201).json({ success: true, orderId: order._id, total: order.total });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// GET /api/orders/my
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/orders — admin only
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/orders/:id — admin only
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ error: 'Не найдено' });
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/orders/:id/status — admin only
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const validStatuses = ['pending','paid','confirmed','shipped','delivered','cancelled'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
