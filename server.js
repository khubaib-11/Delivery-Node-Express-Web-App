const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: 'config.env' });

// ! Switching & Connecting Databases according to environment-

let DB;

if (process.env.NODE_ENV === 'development') {
  DB = process.env.DEVELOPMENT_DB.replace(
    '<PASSWORD>',
    process.env.DEVELOPMENT_DB_PASSWORD
  );
} else if (process.env.NODE_ENV === 'production') {
  DB = process.env.PRODUCTION_DB.replace(
    '<PASSWORD>',
    process.env.PRODUCTION_DB_PASSWORD
  );
}

console.log(`\n ✅ You are in {${process.env.NODE_ENV}} environment ✅`);

mongoose.connect(DB).then(console.log(`DB connection successful ☑️`));

// ! Starting the Server -

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('Server started 👋👋👋 ... \n');
});

//! Handling Unhandled promise rejections

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Promise Rejection ⚠️ ');
  console.log(`Shutting down because of ${err.name} ---> ${err.message} \n`);
  // Closing server after finishing all requests
  server.close(() => {
    process.exit(1);
  });
});
