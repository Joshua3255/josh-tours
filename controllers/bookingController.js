const stripe = require('stripe')(
  process.env.STRIPE_SECTRET_KEY
);
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const User = require('../models/userModel');

exports.getCheckoutSession = catchAsync(
  async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    const { tourId, startDate } = req.params;

    const success_url =
      // Stripe WebHook only with the real domain.
      process.env.NODE_ENV === 'production'
        ? `${req.protocol}://${req.get(
            'host'
          )}/my-tours?alert=booking`
        : `${req.protocol}://${req.get(
            'host'
          )}/my-tours?tour=${tourId}&user=${
            req.user.id
          }&price=${tour.price}&startDate=${startDate}`;

    const images =
      process.env.NODE_ENV === 'production'
        ? [
            `${req.protocol}://${req.get(
              'host'
            )}/img/tours/${tour.imageCover}`
          ]
        : [
            `https://www.natours.dev/img/tours/${
              tour.imageCover
            }`
          ];

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // success_url: `${req.protocol}://${req.get(
      //   'host'
      // )}/?tour=${req.params.tourId}&user=${
      //   req.user.id
      // }&price=${tour.price}`,
      success_url,
      cancel_url: `${req.protocol}://${req.get(
        'host'
      )}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            unit_amount: tour.price * 100, // it's cents
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images
            }
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      metadata: {
        tourStartDate: startDate
      }
    });
    // 3) Create session aas respones
    res.status(200).json({
      status: 'success',
      session
    });
  }
);

exports.createBookingCheckout = catchAsync(
  async (req, res, next) => {
    //This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying.
    const { tour, user, price, startDate } = req.query;

    const startDateConverted = new Date(startDate);
    if (!tour && !user && !price) return next();
    await Booking.create({
      tour,
      user,
      price,
      startDate: startDateConverted
    });

    res.redirect(
      `${req.originalUrl.split('?')[0]}?alert=booking`
    );
  }
);

const createBookingCheckoutFunction = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({
    email: session.customer_email
  })).id;
  const price =
    //session.line_items.price_data.unit_amount / 100;
    session.amount_total / 100;

  const startDate = new Date(
    session.metadata.tourStartDate
  );

  await Booking.create({ tour, user, price, startDate });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res
      .status(400)
      .send(`Webhook error: ${err.message}`); // send error to STRIPE
  }

  if (event.type === 'checkout.session.completed') {
    createBookingCheckoutFunction(event.data.object);
  }
  res.status(200).json({ received: true });
};

exports.getBookingIdByUserIdAndTourId = catchAsync(
  async (req, res, next) => {
    const bookingId = await Booking.findOne({
      tour: req.body.tour,
      user: req.body.user
    })._id;

    console.log('bookingId', bookingId);

    res.status(200).json({
      status: 'success',
      data: bookingId
    });
  }
);

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
