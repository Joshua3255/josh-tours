const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router(); // mergeParams:true  allow to access parent's params

router.use(authController.protect);

router.get(
  '/checkout-session/:tourId',
  bookingController.getCheckoutSession
);

router.get(
  '/getBookingIdByUserIdAndTourId',
  bookingController.getBookingIdByUserIdAndTourId
);

router
  .route('/reviewUpdated/:id')
  .patch(
    authController.protect,
    bookingController.updateBooking
  );

router.use(
  authController.restrictTo('admin', 'lead-guide')
);
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
