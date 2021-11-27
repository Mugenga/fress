const config = require("config");
const logger = require("../logging");
const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(
  process.env.NODE_ENV !== "production"
    ? `${config.get("db.url")}`
    : process.env.SENDGRID_API_KEY
);

const sendmailWithSendGrid = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: "hello@bafana.io",
      subject,
      html,
    };
    await sendgrid.send(msg);
  } catch (error) {
    logger.warn(error);
  }
};

module.exports.sendGrid = sendmailWithSendGrid;
