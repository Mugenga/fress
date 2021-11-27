const logger = require('../logging');
module.exports = (err, req, res, next) => {
  logger.error(err.message, err);
  res
    .status(500)
    .send({ status: 500, errors: ['Something abnormal happened.'] });
};
