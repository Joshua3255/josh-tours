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

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: `${err.message}`,
    stack: err.stack
  });
};

const sendErrorProduction = (err, res) => {
  //Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: `${err.message}`
    });
    //Programming or other unknown error: don't leak erro details
  } else {
    // 1) Log error
    console.error('ERROR ❌', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
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
    sendErrorProduction(error, res);
  }
};
