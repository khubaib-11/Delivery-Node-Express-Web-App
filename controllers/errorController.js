//! This will be called when environment is === 'production'
const sendProductionError = (error, res) => {
  // 1) Only send these details to user if error === isOperational
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

    // 2) If error comes from a packages or is a programming bug, don't leak error details. Send a normal message.
  } else {
    // 1) Logging error
    console.error(`An Error occurred ⛔`, { error });

    // 2) Sending a formal message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong.',
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
    line: error.lineNumber, // optional
    cause: error.cause, // optional
  });
};

//* This is Global error handling middleware used in app.js -
module.exports = (error, req, res, next) => {
  // Default settings
  error.statusCode = error.statusCode || 'error';
  error.status = error.status || 500;

  if (process.env.NODE_ENV === 'development') {
    sendDevelopmentError(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendProductionError(error, res);
  }
};
