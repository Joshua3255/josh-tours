/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const submitReview = async (
  rating,
  review,
  tourId,
  bookingId
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/reviews',
      data: {
        review,
        rating,
        tour: tourId,
        booking: bookingId
      }
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Your review has been submitted successfully!'
      );

      const booking = await updateReviewOnBooking(
        bookingId,
        res.data.data.data._id
      );

      window.setTimeout(
        () => location.assign('/my-tours'),
        1000
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const submitReviewUpdate = async (
  rating,
  review,
  reviewId
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/reviews/${reviewId}`,
      data: {
        review,
        rating
      }
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Your review has been updated successfully!'
      );
      window.setTimeout(
        () => location.assign('/my-reviews'),
        1000
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const submitReviewDelete = async (
  reviewId,
  bookingId
) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${reviewId}`,
      data: {
        reviewId
      }
    });

    // const booking = await Booking.find({
    //   user: res.data.user._id,
    //   tour: res.data.tour._id
    // });

    if (res.data.status === 'success') {
      const resFromBooking = await updateReviewOnBooking(
        bookingId,
        null
      );

      //success
      showAlert(
        'success',
        'Your review has been deleted successfully!'
      );
      window.setTimeout(
        () => location.assign('/my-reviews'),
        1000
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateReviewOnBooking = async (
  bookingId,
  reviewId
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/bookings/reviewUpdated/${bookingId}`,
      data: {
        review: reviewId,
        reviewAt: new Date().toISOString()
      }
    });

    if (res.data.status === 'success') {
      return res.data.data.data;
    } else {
      return false;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateBookingIsReviewSubmitted = async (
  bookingId,
  isReviewSubmitted
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/bookings/reviewUpdated/${bookingId}`,
      data: {
        isReviewSubmitted,
        reviewAt: new Date().toISOString()
      }
    });

    if (res.data.status === 'success') {
      return res.data;
    } else {
      return false;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const getBookingIdByUserIdAndTourId = async (
  userId,
  tourId
) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/bookings/getBookingIdByUserIdAndTourId`,
      data: {
        user: userId,
        tour: tourId
      }
    });

    console.log('aaaaaaaaaaaaaaaa', res);

    if (res.data.status === 'success') {
      return res.data;
    } else {
      return false;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
