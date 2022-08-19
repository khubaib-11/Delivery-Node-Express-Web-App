const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get All Users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

// Get one User
exports.getOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(`No user found with this ID.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Create a User
exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Update User
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError(`No user found with this ID.`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Delete One user
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError(`No user found with this ID.`, 404));
  }

  res.status(200).json({
    status: 'success',
    message: `User deleted...`,
    data: null,
  });
});
