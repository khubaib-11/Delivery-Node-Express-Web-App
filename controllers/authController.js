const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

// SignUp
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    // passwordConfirm: req.body.passwordConfirm,
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
