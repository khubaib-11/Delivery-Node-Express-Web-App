const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

// SignUp
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    role: req.body.role,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'success',
    token,
    data: {
      newUser,
    },
  });
});

// Log In
exports.login = catchAsync(async (req, res, next) => {
  //Step 1) Check if user has provided email and password or not
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide an email and a password.', 400));
  }

  //Step 2) Check any user with this email exists in DB
  const foundUser = await User.findOne({ email }).select('+password');

  if (
    !foundUser ||
    !(await foundUser.matchPassword(password, foundUser.password))
  ) {
    return next(new AppError('Incorrect email or password!', 401)); // 401 means unauthorized
  }

  //Step 2) If everything is OK, generate a token
  const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'success',
    token,
  });
});

// Protected Routes handler

// --------------
// Main Functionality ----> protect certain routes from non-logged in users.
// --------------

exports.protectedRoute = catchAsync(async (req, res, next) => {
  // Step 1) Check if user has provided the token & it starts with "Bearer" word.
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    return next(new AppError('Token no found. Please login first.'));
  }
  const token = req.headers.authorization.split(' ')[1];

  // Step 2) Verification of token via JWT
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Step 3) Check any user with this token's id exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // Step 4) Check if user has changed his password after get getting his token or not
  if (currentUser.passwordChangedAfterTokenReceived(currentUser.iat)) {
    return next(
      new AppError('User recently changes password! Please login again', 401)
    );
  }
  // Put user data on the request object
  req.user = currentUser;
  next();
});

//! Authorization:

// User Roles & Permissions
exports.onlyAllowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You are not allowed to perform this action.`, 403)
      );
    }
    next();
  };
};
