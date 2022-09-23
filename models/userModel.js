const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  photo: {
    type: String,
    default: 'Avatar-Male-1.svg',
  },
  firstLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
  },
  secondLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
  },
  orders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
    },
  ],
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  email: {
    type: String,
    required: [true, 'Please provide an Email.'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (passwordConfirm) {
        return passwordConfirm === this.password;
      },
      message: "Both Passwords don't match. Please enter same passwords.",
    },
  },
  passwordModifiedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  accountActive: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//! Document Middleware -

// ===========
// 1) Encrypting Passwords before saving in DB
// ===========

userSchema.pre('save', async function (next) {
  //Step 1) If password is not modified don't hash it, go into next middleware
  if (!this.isModified('password')) {
    return next();
  }

  //Step 2)  If password is modified :
  // Hash the password with cost of 12

  this.password = await bcrypt.hash(this.password, 12);

  // Step 3) Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// ===========
// 2) Setting time, when password is changed
// ===========

userSchema.pre('save', function (next) {
  // Password is not modified or new, don't do anything
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordModifiedAt = Date.now() - 3000;

  next();
});

//! Query Middleware -

// ===========
// 1) Only show active accounts in results
// ===========

userSchema.pre(/^find/, function (next) {
  this.find({ accountActive: { $ne: false } });
  next();
});

//! Instance Methods -

// ===========
// 1) Matching passwords
// ===========

userSchema.methods.matchPassword = async function (
  enteredPassword,
  DBpassword
) {
  return await bcrypt.compare(enteredPassword, DBpassword);
};

// ===========
// 2) Checking if password is changed after token is issued
// ===========

userSchema.methods.passwordChangedAfterTokenReceived = function (
  tokenIssuedAt
) {
  if (this.passwordChangedAt) {
    const passwordChangedDateIntoTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return tokenIssuedAt < passwordChangedDateIntoTime; // 10am < 12am
  }

  // false means password not changes
  return false;
};

// ===========
// 3) Generating token for password reset handler
// ===========

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
