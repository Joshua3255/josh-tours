const path = require('path');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy'); // Only for Heroku

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors()) // only allowr CORS on this specific route

//SET  Security HTTP headers
app.use(helmet());

//Liit requests from same API
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000, //1 hour
  message:
    'Too many requests from this I, please try again in an hour'
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
); // we need raw body. That's why we put this line before Body parser.

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(
  express.urlencoded({ extended: true, limit: '10kb' })
); // allowed to parse form data. So we can see the form data using req.body

// Data Sanitization against NoSQL query injection  ex: condition on user table  {"email": {"$gt":""}}
app.use(mongoSanitize());

// Data Sanitization against XSS
//  If I put "data <div id='badcode'>Name</div>""  , xss would convert like this "&lt;div id='badcode'>Name&lt;/div>"
app.use(xss());

// Prevent parameter pollution
// ex)  {{URL}}/api/v1/tours?sort=duration&sort=pricce
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

app.use(compression()); //compress all text of our responses

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) Routers (mounting)
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(
  //   `Can't find ${req.originalUrl} on this server!`
  // );
  // err.status = 'fail';
  // err.statusCode = 404;

  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      400
    )
  );
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // });
}); // Handle all remained url

app.use(globalErrorHandler);

// 4) Start Server
module.exports = app;
