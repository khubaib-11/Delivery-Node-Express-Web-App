const express = require('express');

const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//* Middleware -
app.use(express.json());

//* Routes -
app.use('/api/v1/users', userRouter);

//? Unhandled route -
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

//? Global Error Handling Middleware -
app.use(globalErrorHandler);

module.exports = app;
