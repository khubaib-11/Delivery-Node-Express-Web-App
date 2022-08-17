const User = require('../models/userModel');

// Get All Users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
