/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51PdC9uHURZYMsx25BiTkwq8rdG2tgt2CfgjOvJfHCt6LozQov3lvCKCC4auXboY07DbofNJoKUZRHl9oIp0rpYgb008bdgVCz9'
);

export const bookTour = async (tourId, selectedDate) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}/${selectedDate}`
    );

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('errer', err);
  }
};
