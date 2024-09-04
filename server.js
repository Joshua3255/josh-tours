const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! ❌ Shutting down...');
  console.log(err.name, err.message, '\nstack:', err.stack);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '#PASSWORD#',
  process.env.DATABASE_PASSWORD
);

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    userFindAndModify: false
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection successful!');
  });
//.catch(err => console.log('ERROR'));

// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log(err);
  console.log('UNHANDLER REJECTION! ❌ Shutting down...');
  // For running Demo server continuosly, do not run process.exit when we had unhandledRejection errors
  // server.close(() => {
  //   process.exit(1);
  // });
});

process.on('SIGTERM', () => {
  console.log(
    '✨SIGTERM RECEIVED. Shutting down gracefully'
  );
  server.close(() => {
    console.log('👍 Process terminated!');
  });
});
