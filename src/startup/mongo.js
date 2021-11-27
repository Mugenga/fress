const mongoose = require('mongoose');
const config = require('config');
const logger = require('../logging');

module.exports = () => {
  // const options = {
  //   useNewUrlParser: true,
  //   useCreateIndex: true,
  //   autoIndex: true,
  //   promiseLibrary: global.Promise,
  //   useFindAndModify: false,
  //   useUnifiedTopology: true
  // };

  const options = {
    // useNewUrlParser: true,
    // useCreateIndex: false,
    // useFindAndModify: false,
    // useUnifiedTopology: true,

    // poolSize: 5,

    // promiseLibrary: global.Promise,
    // connectWithNoPrimary: true
  };

  // set up default mongoose connection

  const uri =
    process.env.NODE_ENV !== 'production'
      ? `${config.get('db.url')}`
      : process.env.MONGO_URI;

  mongoose.connect(uri, options);

  // get default connection

  const db = mongoose.connection;

  db.on('connected', () => {
    logger.info(`Mongoose  connection to DB is open.`);
  });
  db.on('error', error => {
    logger.warn('Mongoose connection error: ' + error);
  });
  db.on('disconnected', () => {
    logger.warn('Mongoose  connection is disconnected');
  });
  process.on('SIGINT', () => {
    db.close(() => {
      logger.info(
        'Mongoose connection is disconnected due to application termination'
      );
      process.exit(1);
    });
  });
};
