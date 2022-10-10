const axios = require('axios');
const config = require('config');
const logger = require('../logging');

const SMSHttp = axios.create({
  baseURL: 'https://api.mista.io/sms',
  headers: {
    'x-api-key': '96|X8SPZB9u6oEaxnvIn00aeg9PHtsrGT12cISW52jh '
  }
});

SMSHttp.interceptors.request.use(configuration => {
  const { url, method, params } = configuration;
  logger.info({ url, method, params }, 'Contacting SMS API');

  return configuration;
});

module.exports.SMSHttp = SMSHttp;
