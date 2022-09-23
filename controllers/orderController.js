const Order = require('../models/orderModel');
const Email = require('../utils/email');
const log = require('../utils/consoleLog');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.sendOrder = catchAsync(async (req, res, next) => {
  log.info(req.file.filename);
  log.warn(req.user);
  if (!req.file) return next(new AppError('No picture found.', 404));

  const { user } = req;

  const image = req.file.filename;
  // 1 Create order & save in DB
  const order = await Order.create({ order: req.file.filename });
  // 3 Send message for fail or success
  order.orderingPerson = user;

  const url = `${req.protocol}://${req.get('host')}/signup`;

  await new Email(user, url).sendNewOrderEmail(image);

  res.status(200).json({
    status: 'success',
    message: `Order received from ${req.user.name}`,
    data: {
      order,
    },
  });
});
