const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  email: {
    type: String,
    required: [true, 'Please provide an Email.'],
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
});

//! Document Middleware -

// Encrypting Passwords before saving in DB
userSchema.pre('save', async function (next) {
  //Step 1) If password is not modified don't hash it, go into next middleware
  if (!this.isModified('password')) {
    return next();
  }

  //Step 2)  If password is modified, hash it
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordModifiedAt = Date.now();

  // Step 3) Add passwordChangedAt property
  // this.passwordChangedAt = Date.now();
  next();
});

// userSchema.pre(
//   'updateOne',
//   { document: true, query: false },
//   async function (next) {
//     if (!this.isModified('password')) {
//       console.log('Not modified');
//       return next();
//     }
//     console.log('Updating ............');

//     // Step 3) Add passwordChangedAt property
//     this.passwordModifiedAt = Date.now();
//     next();
//   }
// );

//! Instance Methods -

// 1) Match passwords
userSchema.methods.matchPassword = async function (
  enteredPassword,
  DBpassword
) {
  return await bcrypt.compare(enteredPassword, DBpassword);
};

// 2)
userSchema.methods.passwordChangedAfterTokenReceived = function (
  tokenIssuedAt
) {
  if (this.passwordChangedAt) {
    const dateConvertedToTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return tokenIssuedAt < this.passwordChangedAt; // 10am < 12am
  }

  // false means password not changes
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
