/* eslint-disable no-undef */
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const Joi = require("@hapi/joi");

const userSchema = new mongoose.Schema({
  phone_number: {type: String},
  otp_secret: { type: String },
  is_otp_verified: {type: Boolean, default: false},
  last_subscribed_at: {type: Date},
  subscription_ends_at: {type: Date},
});

// auto-assigned to the most recent create/update timestamp
userSchema.plugin(timestamps, {
  createdAt: "created_at",
  updatedAt: "updatedAt"
});
// Method to generate jwt.
/** We use regular function syntax instead of arrow key for us to be able to use this */
userSchema.methods.generateAuthToken = function(keyDuration) {
  const token = jwt.sign({ id: this._id }, config.get("app.jwtKey"), {
    expiresIn: keyDuration
  });
  return token;
};

/******* End ********************/
const users = mongoose.model("users", userSchema);

const validateUser = userData => {
  const schema = {
    phone_number: Joi.string()
      .min(1)
      .required(),
  };
  return Joi.object(schema).validate(userData);
};

// Validation of National ID
const validateEmail = isEmail => {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      // .email()
      .regex(
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/,
        "Email"
      )
      .required()
  };
  return Joi.validate(isEmail, schema);
};

const validateLogin = login => {
  const schema = {
    phone_number: Joi.string()
      .min(10)
      .max(12)
      .regex(
        /^\d/,
        "Phone Number"
      )
      .required(),
    otp: Joi.number()
      .min(6)
      .required()
  };
  return Joi.object(schema).validate(login);
};

// Validation of Token
const validateToken = isToken => {
  const schema = {
    token: Joi.string()
      .min(60)
      .trim()
      .required()
  };
  return Joi.validate(isToken, schema);
};

const validateSendMail = data => {
  const schema = {
    to: Joi.array()
      .items(
        Joi.string()
          .min(5)
          .max(255)
          .regex(
            /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/,
            "Email"
          )
          .required()
      )
      .required(),
    subject: Joi.string().required(),
    content: Joi.string().required()
  };
  return Joi.validate(data, schema);
};


module.exports.User = users;
module.exports.validate = validateUser;
module.exports.isEmail = validateEmail;
module.exports.validateLogin = validateLogin;
module.exports.validateToken = validateToken;
module.exports.validateSendMail = validateSendMail;