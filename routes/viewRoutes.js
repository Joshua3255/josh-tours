const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(viewsController.alerts);
router.get(
  '/',
  authController.isLoggedIn,
  viewsController.getOverview
);

router.get('/signup', viewsController.getSignup);

router.get(
  '/overview',
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewsController.getTour
);
router.get(
  '/login',
  authController.isLoggedIn,
  viewsController.getLogin
);
router.get(
  '/me',
  authController.protect,
  viewsController.getAccount
);

router.get(
  '/my-tours',
  bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyTours
);

router.get(
  '/my-reviews',
  authController.protect,
  viewsController.getMyReviews
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
