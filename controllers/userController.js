const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterIncomingFields = function (object, ...allowedFields) {
  const newObject = {};

  Object.keys(object).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObject[el] = object[el];
    }
  });
  return newObject;
};

// Update Me (user updates his data- passwords are not included in this route handler)
exports.updateMe = catchAsync(async (req, res, next) => {
  // Step 1) Reject request if user tries to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for updating passwords.Please use /updatePassword',
        400
      )
    );
  }

  // Step 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterIncomingFields(req.body, 'name', 'email');

  // Step 3) Update Users data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

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
  // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // this.password = await bcrypt.hash(this.password, 12);
  // this.passwordModifiedAt = Date.now();

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
