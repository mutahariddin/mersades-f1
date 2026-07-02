const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  nameRu:        { type: String, trim: true },
  price:         { type: Number, required: true, min: 0 },
  costPrice:     { type: Number, default: 0, min: 0 },
  logisticsCost: { type: Number, default: 0, min: 0 },
  image:         { type: String, required: true },
  category:      { type: String, enum: ['clothing', 'accessories', 'collectibles'], default: 'clothing' },
  description:   { type: String },
  descriptionRu: { type: String },
  inStock:       { type: Boolean, default: true },
  stock:         { type: Number, default: 0, min: 0 },
  minStock:      { type: Number, default: 3, min: 0 },
  sku:           { type: String, trim: true },
  supplier:      { type: String, trim: true },
  warehouseLocation: { type: String, trim: true },
  badge:         { type: String },
  sizes:         [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
