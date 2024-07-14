const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err, errorMessage) => {
  const value = errorMessage.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(
    el => el.message
  );
  const message = `Invalid input data. ${errors.join(
    '. '
  )}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token, Please log in again!', 401);

const handleTokenExpiredError = () =>
  new AppError(
    'Your token has expired. Please log in again!',
    401
  );

const sendErrorForDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: `${err.message}`,
      stack: err.stack
    });
  }
  // RENDERED WEBSITE
  console.error('ERROR ❌', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProduction = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: `${err.message}`
      });
      //Programming or other unknown error: don't leak erro details
    }
    // 1) Log error
    console.error('ERROR ❌', err);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: `${err.message}`
    });
  }
  // 1) Log error
  console.error('ERROR ❌', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later,'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError')
      error = handleCastErrorDB(error);
    if (err.code === 11000)
      error = handleDuplicateFieldsDB(
        error,
        `${err.message}`
      );
    if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }

    //if(err.name === 'TokenExpiredError')
    sendErrorProduction(error, req, res);
  }
};
