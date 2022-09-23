const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/welcome', viewController.welcome);
router.get('/signup', viewController.signup);
router.get('/login', viewController.login);

router.use(authController.isLoggedIn);

// router.get('/', authController.isLoggedIn, viewController.home);
router.get('/', authController.isLoggedIn, viewController.home);
// router.get('/profile', authController.protectedRoute, viewController.profile);
router.get('/profile', authController.protectedRoute, viewController.profile);
router.get(
  '/editProfile',
  authController.protectedRoute,
  viewController.editProfile
);
router.get('/location', viewController.location);
router.get('/map', viewController.map);
router.get('/admin', viewController.admin);

module.exports = router;
