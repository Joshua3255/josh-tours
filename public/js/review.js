/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const submitReview = async (
  rating,
  review,
  tourId
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/reviews',
      data: {
        review,
        rating,
        tour: tourId
      }
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Your review has been submitted successfully!'
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
