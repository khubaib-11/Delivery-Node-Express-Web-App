const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const logger = require('tracer');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const orderRouter = require('./routes/orderRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
// app.use(cors());

//! Global Middleware -

logger.colorConsole();

// 1) Set security HTTP headers
// app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// 2) Body parser, reading data from body into req.body

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// app.use((req, res, next) => {
//   console.log(req.file);
//   next();
// });

//* Routes -

app.use('/', viewRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);

//? Unhandled route -

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

//? Global Error Handling Middleware -

app.use(globalErrorHandler);

module.exports = app;
