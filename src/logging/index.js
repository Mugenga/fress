const { transports, createLogger, format } = require('winston');
const appRoot = require('app-root-path');
const config = require('config');
const isJSON = require('is-json');

const MESSAGE = Symbol.for('message');

const jsonFormatter = logEntry => {
  const base = { timestamp: new Date() };
  const json = Object.assign(base, logEntry);
  logEntry[MESSAGE] = JSON.stringify(json);
  return logEntry;
};

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: config.get('app.name') },
  transports: [
    new transports.File({
      filename: `${appRoot}/logs/error.log`,
      level: 'error'
    }),
    new transports.File({ filename: `${appRoot}/logs/combined.log` })
  ]
});

// console in dev mode

// if (process.env.NODE_ENV !== 'production') {
logger.add(
  new transports.Console({
    format: format.combine(
      format.timestamp(),
      format(jsonFormatter)(),
      format.colorize(),
      format.printf(message => {
        return (
          Object.keys(message)
            .reverse()
            .reduce((acc, key, i) => {
              if (typeof key === 'string') {
                if (i > 0) acc += ', ';
                acc += `"${key}": "${message[key]}"`;
              }

              return acc;
            }, '{ ') + ' }'
        );
      })
    )
  })
);

// }

module.exports = logger;
