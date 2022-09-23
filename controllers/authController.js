const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const createToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = function (user, statusCode, res) {
  const token = createToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    sameSite: true,
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

  const url = `${req.protocol}://${req.get('host')}/signup`;

  await new Email(newUser, url).sendWelcomeEmail();

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

exports.logout = (req, res, next) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};

/* ===========
 Protected Routes handler :

 Main Functionality ----> protect certain routes from non-logged in users.
 =========== */

exports.protectedRoute = catchAsync(async (req, res, next) => {
  // Step 1) Check if user has provided the token & it starts with "Bearer" word.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Token no found. Please login first.'));
  }
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

  // GRANT ACCESS TO PROTECTED ROUTE
  // Put user data on the request object
  req.user = currentUser;
  res.locals.user = currentUser;
  // res.locals.user = currentUser;
  next();
});

// Only for Rendered pages, no errors here
exports.isLoggedIn = async (req, res, next) => {
  // 1) Getting token and check of it's there
  if (req.cookies.jwt) {
    // 2) verify token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.passwordChangedAfterTokenReceived(decoded.iat)) {
      return next();
    }

    // There is logged in user
    res.locals.user = currentUser;
    return next();
  }

  res.locals.user = 'guest';
  next();
};

// Only Allowed
exports.onlyAllowedTo = function (...roles) {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
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

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordResetEmail();

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
