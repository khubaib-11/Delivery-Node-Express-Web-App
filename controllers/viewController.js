const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Welcome Screen
exports.welcome = catchAsync(async (req, res) => {
  res.status(200).render('../views/welcome.ejs', {
    title: 'Welcome :)',
  });
});

// Sign Up Screen
exports.signup = catchAsync(async (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self' http://127.0.0.1:3000/")
    .render('../views/auth/signup.ejs', {
      title: 'Sign Up',
    });
});

// Log In Screen
exports.login = catchAsync(async (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self' http://127.0.0.1:3000/")
    .render('../views/auth/login.ejs', {
      title: 'Log in',
    });
});

// Home Screen
exports.home = catchAsync(async (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self' http://127.0.0.1:3000/")
    .render('../views/home.ejs', {
      title: 'Home',
    });
});

// Profile Screen
exports.profile = catchAsync(async (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self' http://127.0.0.1:3000/")
    .render('../views/user/profile.ejs', {
      title: 'My Profile',
    });
});
exports.editProfile = catchAsync(async (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self' http://127.0.0.1:3000/")
    .render('../views/user/editProfile.ejs', {
      title: 'Edit Profile',
    });
});

// Location Adding tips Screen
exports.location = catchAsync(async (req, res) => {
  res.status(200).render('../views/user/location.ejs', {
    title: 'Add Address',
  });
});

// Map Screen
exports.map = catchAsync(async (req, res) => {
  res.status(200).render('../views/user/map.ejs', {
    title: 'Your Location',
  });
});

// Admin Screen
exports.admin = catchAsync(async (req, res) => {
  res.status(200).render('../views/admin/salesDashBoard.ejs', {
    title: 'Sales Dashboard',
  });
});
