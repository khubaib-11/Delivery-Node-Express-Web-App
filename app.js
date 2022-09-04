const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//! Global Middleware -

// 1) Set security HTTP headers
app.use(helmet());

// 2) Body parser, reading data from body into req.body

app.use(express.json({ limit: '10kb' }));

// 3) Prevent NO SQL attack
app.use(mongoSanitize());

// 3) Prevent Cross Side Scripting attack
app.use(xss());

// 4) Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: ['price'],
  })
);

// 5) Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4) Limit requests from same IP
const limitRequests = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // allow 100 requests
  message: 'Too many requests from this IP, please try again after an hour!',
});

app.use('/api', limitRequests);

//* Routes -

app.use('/api/v1/users', userRouter);

//? Unhandled route -

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

//? Global Error Handling Middleware -

app.use(globalErrorHandler);

module.exports = app;
