const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// SignUp and Login Routes
router.post('/signup', authController.signUp);
router.post('/login', authController.login);

// Update Password Route (non-forgotten)
router.patch(
  '/updatePassword',
  authController.protectedRoute,
  authController.updatePassword
);

// Forgot Password and Reset Password Routes
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:resetToken', authController.resetPassword);

router
  .route('/')
  .get(authController.protectedRoute, userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(
    authController.protectedRoute,
    authController.onlyAllowedTo('admin'),
    userController.deleteUser
  );

module.exports = router;
