/* eslint-disable */
import '@babel/polyfill';
import { login, logout, signup } from './login';
import {
  submitReview,
  submitReviewUpdate,
  submitReviewDelete
} from './review';

import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const reviewForm = document.querySelector('.form--review');
const reviewFormUpdate = document.querySelector(
  '.form--review--update'
);

const logOutBtn = document.querySelector(
  '.nav_el---logout'
);
const userDataForm = document.querySelector(
  '.form-user-data'
);
const userPasswordForm = document.querySelector(
  '.form-user-password'
);
const bookBtn = document.getElementById('book-tour');

//VALUES

if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password')
      .value;
    login(email, password);
  });
}

if (signupForm) {
  // console.log('signupForm', signupForm);

  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phoneNum = document.getElementById('phoneNum')
      .value;
    const password = document.getElementById('password')
      .value;
    const passwordConfirm = document.getElementById(
      'passwordConfirm'
    ).value;

    // This logic had already been in the User Schema
    // if (password !== passwordConfirm){
    //   showAlert('error', 'Confirmed password was not matched!');
    //   return false;
    // }
    signup(
      name,
      email,
      password,
      passwordConfirm,
      phoneNum
    );
  });
}

if (reviewForm) {
  reviewForm.addEventListener('submit', e => {
    e.preventDefault();
    const review = document.getElementById('review').value;
    const ratings = document.getElementsByName('rating');
    let rating;
    const tourId = document.getElementById('tourId').value;
    const bookingId = document.getElementById('bookingId')
      .value;

    ratings.forEach(button => {
      if (button.checked) {
        rating = button.value;
      }
    });

    submitReview(rating, review, tourId, bookingId);
  });
}

if (reviewFormUpdate) {
  reviewFormUpdate.addEventListener('submit', e => {
    e.preventDefault();
    const review = document.getElementById('review').value;
    const ratings = document.getElementsByName('rating');
    let rating;
    const reviewId = document.getElementById('reviewId')
      .value;
    const bookingId = document.getElementById('bookingId')
      .value;

    ratings.forEach(button => {
      if (button.checked) {
        rating = button.value;
      }
    });

    submitReviewUpdate(rating, review, reviewId);
  });

  const deleteBtn = document.querySelector(
    '.form--review--update .btn--red'
  );

  deleteBtn.addEventListener('click', e => {
    e.preventDefault();
    const reviewId = document.getElementById('reviewId')
      .value;
    const bookingId = document.getElementById('bookingId')
      .value;

    submitReviewDelete(reviewId, bookingId);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append(
      'name',
      document.getElementById('name').value
    );
    form.append(
      'email',
      document.getElementById('email').value
    );
    form.append(
      'photo',
      document.getElementById('photo').files[0]
    );
    form.append(
      'phoneNum',
      document.getElementById('phoneNum').value
    );

    //console.log(form);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector(
      '.btn--save--password'
    ).textContent = 'Updating...';
    const passwordCurrent = document.getElementById(
      'password-current'
    ).value;
    const password = document.getElementById('password')
      .value;
    const passwordConfirm = document.getElementById(
      'password-confirm'
    ).value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector(
      '.btn--save--password'
    ).textContent = 'SAVE PASSWORD';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    const { tourId, selectedDate } = e.target.dataset;

    if (!selectedDate) {
      showAlert(
        'error',
        'Please select an available date first!!',
        8
      );
      return false;
    }
    e.target.textContent = 'Processing...';
    bookTour(tourId, selectedDate);
  });
}

const alertMessage = document.querySelector('body').dataset
  .alert;
if (alertMessage) showAlert('success', alertMessage, 8);
