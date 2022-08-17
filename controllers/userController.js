const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

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
  const user = await User.findOne(req.params);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

