const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  console.log(err);
  const message = `Invalid : ${err.path} : ${err.value} -------`;
  return new AppError(message, 404);
};

const handleDuplicateFieldDB = (err) => {
  const value = err.keyValue.name;
  // console.log(value);
  const message = `Duplicate filed value : ---> ${value}. Please try a different value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = err.message;
  console.log(message);
  return new AppError(message, 400);
};

const handleJwtTokenError = () => {
  return new AppError(
    'Your token is invalid / modified. Please login again.',
    401
  );
};

const handleExpiredToken = () =>
  new AppError(
    'Your token is Expired. Please login again to get a fresh token.',
    401
  );

//! This will be called when environment is === 'production'

const sendProductionError = (error, res) => {
  // 1) Only send these details to user if error === isOperational
  if (error.isOperational) {
    console.error(`An Error occurred ⚠️`, error);

    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

    // 2) If error comes from a packages or is a programming bug, don't leak error details. Send a normal message.
  } else {
    // 1) Logging error
    console.log(`An Error occurred ⛔`, error);

    // 2) Sending a formal message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong.',
      error: error,
    });
  }
};

//! This will be called when environment is === 'development'

const sendDevelopmentError = (error, res) => {
  // Send as much details as possible to programmers, so they can fix error.
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
    name: error.name,
    // line: error.lineNumber, // optional
    // cause: error.cause, // optional
  });
};

//* This is Global error handling middleware used in app.js -
module.exports = (err, req, res, next) => {
  // Default settings
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevelopmentError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    let error = Object.create(err);

    //? Handling invalid id errors (needs edit with path) -
    if (error.path === '_id') error = handleCastErrorDB(error);

    // Handling duplicate fields errors
    if (error.code === 11000) error = handleDuplicateFieldDB(error);

    // Handling invalid data in inputs
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    // ### Handling JWT ERRORS ###

    // Invalid JWT token handler
    if (error.name === 'JsonWebTokenError') error = handleJwtTokenError();

    // Expired JWT token handler
    if (error.name === 'TokenExpiredError') error = handleExpiredToken();

    sendProductionError(error, res);
  }
};
