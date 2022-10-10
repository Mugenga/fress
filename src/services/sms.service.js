/* APIS for communicating with the common communication service */

const { SMSHttp } = require("../httpConfig/sms");

/* Request to authenticate application */
const sendSMS = async (data) => {
  try {
    return await SMSHttp.post("/", data);
  } catch (error) {
    console.log(error)
    return error;
  }
};


module.exports.sendSMS = sendSMS;