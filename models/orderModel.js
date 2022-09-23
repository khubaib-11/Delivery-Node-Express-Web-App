const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orderingPerson: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
