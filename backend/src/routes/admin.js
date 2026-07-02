const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(authMiddleware, adminOnly);

// GET /api/admin/stats — dashboard summary
router.get('/stats', async (req, res) => {
  try {
    const paidStatuses = ['paid', 'confirmed', 'shipped', 'delivered'];
    const [totalOrders, totalUsers, totalProducts, revenue, productFinance, soldCosts] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: paidStatuses } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: null,
            stockUnits: { $sum: { $ifNull: ['$stock', 0] } },
            stockCost: {
              $sum: {
                $multiply: [
                  { $ifNull: ['$stock', 0] },
                  { $add: [{ $ifNull: ['$costPrice', 0] }, { $ifNull: ['$logisticsCost', 0] }] },
                ],
              },
            },
            stockValue: { $sum: { $multiply: [{ $ifNull: ['$stock', 0] }, '$price'] } },
            lowStock: {
              $sum: {
                $cond: [
                  { $lte: [{ $ifNull: ['$stock', 0] }, { $ifNull: ['$minStock', 3] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Order.aggregate([
        { $match: { status: { $in: paidStatuses } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: [
                  '$items.quantity',
                  { $add: [{ $ifNull: ['$product.costPrice', 0] }, { $ifNull: ['$product.logisticsCost', 0] }] },
                ],
              },
            },
            units: { $sum: '$items.quantity' },
          },
        },
      ]),
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const totalRevenue = revenue[0]?.total || 0;
    const expenses = soldCosts[0]?.total || 0;

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      revenue: totalRevenue,
      expenses,
      profit: totalRevenue - expenses,
      soldUnits: soldCosts[0]?.units || 0,
      stockUnits: productFinance[0]?.stockUnits || 0,
      stockCost: productFinance[0]?.stockCost || 0,
      stockValue: productFinance[0]?.stockValue || 0,
      lowStock: productFinance[0]?.lowStock || 0,
      recentOrders,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
