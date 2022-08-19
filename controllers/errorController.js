//* This is Global error handling middleware used in app.js -
module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 'error';
  error.status = error.status || 500;

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};
