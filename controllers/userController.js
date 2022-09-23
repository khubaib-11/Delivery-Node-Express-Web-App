const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.addLocation = catchAsync(async (req, res, next) => {
  // const location = req.body;
  // console.log(location);
  // 1 Update users location
  const updatedUserLocation = await User.findByIdAndUpdate(
    req.user._id,
    req.body,
    {
      new: true,
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Address added successfully',
    data: {
      updatedUserLocation,
    },
  });
});
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Not an image! Please upload only images. Reload page to try again!',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  // dest: 'public/images/users',
});

exports.uploadUserPhoto = upload.single('photo');
exports.uploadUserOrder = upload.single('order');

exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/users/${req.file.filename}`);

  next();
});

exports.saveOrder = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  req.file.filename = `ORDER=user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/orders/${req.file.filename}`);

  next();
});

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
  if (req.file) filteredBody.photo = req.file.filename;

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

// Delete Me (Deactivates users account)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    accountActive: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// =============================
// FOR ADMINS ONLY
// =============================
// Get All Users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
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
