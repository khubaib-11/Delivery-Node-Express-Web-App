const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post(
  '/',
  authController.protectedRoute,
  userController.uploadUserOrder,
  userController.saveOrder,
  orderController.sendOrder
);

module.exports = router;
