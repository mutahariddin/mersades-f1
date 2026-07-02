const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:      String,
    price:     Number,
    quantity:  { type: Number, default: 1 },
    image:     String,
    size:      String,   // ← теперь сохраняется размер
  }],
  total: { type: Number, required: true },
  customer: {
    name:    String,
    email:   String,
    phone:   String,
    address: String,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  stripePaymentIntentId: { type: String },
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
