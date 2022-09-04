const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');

const createToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = function (user, statusCode, res) {
  const token = createToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Send Token via Cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// SignUp
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Send Token
  sendToken(newUser, 201, res);
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

  //Step 2) If everything is OK, send token
  sendToken(foundUser, 200, res);
});

/* ===========
 Protected Routes handler :

 Main Functionality ----> protect certain routes from non-logged in users.
 =========== */

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

// 1) --- User Roles & Permissions
exports.onlyAllowedTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You are not allowed to perform this action.`, 403)
      );
    }
    next();
  };

// 2) --- Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Step1) Find user based on POSTED email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // Step2) Generate the random reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Step3) Send reset token to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Don't worry 😉. Use this link to reset your password : ${resetURL}. \n If you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token is valid for 10 minutes.',
      message,
    });

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Email sent ',
      },
    });
  } catch (err) {
    // If error occurs reset token and its expiration time
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending email. Try again later!', 500)
    );
  }
});

// 3) --- Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Step 1) Find user based on ID
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  // Step 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  // Step 3) Everything is correct, change password & remove token data from DB
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save();
  // 4) Log the user in & send back a JWT token
  sendToken(user, 200, res);
});

// 4) --- Update logged in user password (non-forgotten)
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Step 1) Get user from DB based on password
  const user = await User.findById(req.user.id).select('+password');

  // Step 2) Check if POSTed current password is correct
  if (!(await user.matchPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your password is wrong.', 401));
  }
  // Step 3) Update Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  // Step 4) Log the user in & send back a JWT token
  sendToken(user, 200, res);
});
