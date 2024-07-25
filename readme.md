# Josh Tours Application

## Introduction

This project is my personal project where I present my projects and experiences. It was developed using **Nodejs, Express, MongoDB Atlas, Mongoose, Restful Api, MapBox** and is deployed on my **HomeServer** with Ngrok

Welcome to the Tour Booking Site! This project is a comprehensive web application designed to provide users with a seamless experience for exploring and booking various tours across different locations. Whether you're an adventure enthusiast, a nature lover, or someone looking to relax and explore new cities, this site has a tour for you.

## Demo Link

You can explore this by clicking on [Josh Tours Website](https://classic-sunny-clam.ngrok-free.app/).

## Technology Features

- Feature-rich **RESTful API** (includes filters, sorts, pagination, and much more)
- Authentication and authorization using **JWT**
- **Security**: encryption(bcryptjs), sanitization(express-mongo-sanitize), rate limiting(express-rate-limit), secured HTTP headers(Helmet)
- Server-side website rendering with **Pug templates**
- Secure Payments: **Integrated Stripe payment** form for secure transactions.
- Sending emails with **PostMark** & uploading files to **MongoDB Atlas**

## User-Facing Features

- Explore Tours: Browse through a variety of tours with detailed information, including duration, difficulty level, price, and starting locations.
- Tour Details: Each tour comes with a detailed description, itinerary, images, and start dates to help you make an informed decision.
- User Reviews: Check out user ratings and reviews to see what others have to say about their experiences.
- Interactive Maps: View the locations and itineraries on interactive maps for better visualization.
- Booking System: Secure and straightforward booking process to reserve your spot on the tour of your choice.

## Installation and Usage

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Joshua3255/josh-tours.git
    ```
2.  Navigate to the project directory:

3.  Install the necessary packages:
    ```bash
    npm install
    ```
4.  Create a `config.env` file in the root directory of your project and add the following parameters:

- NODE_ENV=development
- PORT=3000
- DATABASE={Your MongoDB Atlas}
- DATABASE_LOCAL={Your local MongoDB}
- DATABASE_PASSWORD={Your variable}
- JWT_SECRET={Your variable}
- JWT_EXPIRES_IN=90d
- JWT_COOKIE_EXPIRES_IN=90
- EMAIL_USERNAME={Your mailtrap.io variable}
- EMAIL_PASSWORD={Your mailtrap.io variable}
- EMAIL_HOST=sandbox.smtp.mailtrap.io
- EMAIL_PORT=2525
- // For production
- EMAIL_FROM={Your variable}
- SENDGRID_USERNAME=apikey
- SENDGRID_PASSWORD=password
- POSTMARK_HOST=smtp.postmarkapp.com
- POSTMARK_USERNAME={Your variable}
- POSTMARK_PASSWORD={Your variable}
- STRIPE_SECTRET_KEY={Your variable}
- STRIPE_WEBHOOK_SECRET={Your variable}

### Running the Project

5.  Start the development server (3 mode - Without nodemon, Development, Production):

    ```bash
    npm start  or
    npm run start:dev  or
    npm run start:prod

    ```

6.  Open your browser and go to:
    ```bash
    http://localhost:3000
    ```

## Contact

Feel free to reach out to me for any questions or feedback:

- Email: [joshua80.ko@gmail.com](mailto:joshua80.ko@gmail.com)
