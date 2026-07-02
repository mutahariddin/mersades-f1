const router = require('express').Router();
const Order = require('../models/Order');

let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('REPLACE')) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch {
  console.warn('⚠ Stripe not configured');
}

// POST /api/payment/create-intent
router.post('/create-intent', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe не настроен. Добавьте STRIPE_SECRET_KEY в .env' });
  try {
    const { amount, orderId } = req.body;
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { orderId: orderId || '' },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/payment/webhook
router.post('/webhook', require('express').raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.sendStatus(200);
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const orderId = intent.metadata?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        status: 'paid',
        stripePaymentIntentId: intent.id,
        paidAt: new Date(),
      });
    }
  }
  res.json({ received: true });
});

module.exports = router;
