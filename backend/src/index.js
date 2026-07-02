require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./db');

const app = express();

app.use('/api/payment/webhook', require('./routes/payment'));

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Juda ko'p so'rov yuborildi. Keyinroq urinib ko'ring." },
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/pilots', require('./routes/pilots'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', version: '3.0.0' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server ichki xatosi' });
});

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running: http://localhost:${PORT}`));
});
