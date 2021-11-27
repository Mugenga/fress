/* eslint-disable no-undef */
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const Joi = require("@hapi/joi");

const userSchema = new mongoose.Schema({
  foreName: {
    type: String,
    maxlength: 100,
    trim: true,
    index: true,
    uppercase: true
  },
  surname: {
    type: String,
    maxlength: 100,
    trim: true,
    index: true,
    uppercase: true
  },
  email: {
    type: String,
    match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/,
    lowercase: true,
    trim: true,
    sparse: true,
    unique: true,
    index: true
  },
  password: { type: String },
  sex: {
    type: String,
    enum: ["M", "F", ""],
    uppercase: true,
    trim: true,
    index: true
  },
  status: { type: Number, default: 0 }, // pending:0, active:1, locked:2,  expired:3
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
    foreName: Joi.string()
      .min(1)
      .required(),
    surname: Joi.string()
      .min(2)
      .max(100)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .email()
      .required(),
    password: Joi.string()
      .min(8)
      .max(255)
      .required(),
    sex: Joi.string()
      .valid()
      .required(),
    status: Joi.number()
      .min(0)
      .max(9)
  };
  return Joi.object(schema).validate(userData); //, { convert: false }
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
    email: Joi.string()
      .min(5)
      .max(255)
      // .email()
      .regex(
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/,
        "Email"
      )
      .required(),
    password: Joi.string()
      .min(8)
      .max(255)
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

//Basic Edit user
const validateUserUpdate = updateUserData => {
  const schema = {
    id: Joi.objectId().required(),
    foreName: Joi.string()
      .min(1)
      .max(100),
    surname: Joi.string()
      .min(2)
      .max(100),
    phone_number: Joi.string()
      .regex(/^2507\d{8}$/, "Phone number")
      .trim(),

    dob: Joi.date(),
    NID: Joi.string()
      .length(16)
      .trim(),

    sex: Joi.string().valid(["m", "f"]),

    org_id: Joi.objectId(),

    location: Joi.object({
      prov_id: Joi.objectId().required(),
      dist_id: Joi.objectId().required(),
      sect_id: Joi.objectId(),
      cell_id: Joi.objectId(),
      village_id: Joi.objectId()
    }),
    lastModifiedBy: Joi.object({
      _id: Joi.objectId().required(),
      name: Joi.string().required()
    }).required()
  };
  return Joi.validate(updateUserData, schema, { convert: true });
};

//Full User Edit Validator
const validateUserUpdateFull = updateUserData => {
  const schema = {
    id: Joi.objectId().required(),
    foreName: Joi.string()
      .min(2)
      .max(100),

    surname: Joi.string()
      .min(2)
      .max(100),

    hasAccessTo: Joi.array().items(
      Joi.object({
        app: Joi.number().required(),
        userType: Joi.number().required()
      })
    ),

    // Here email should be edited only if account is still inactive
    // Means user is yet approved email
    email: Joi.string()
      .min(5)
      .max(255)
      .regex(
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/,
        "Email"
      ),

    // Editing organization is only available for naeb && BKTECH
    org_id: Joi.objectId(),

    userRoles: Joi.array().items(Joi.number().required()),

    phone_number: Joi.string()
      .regex(/^2507\d{8}$/, "Phone number")
      .trim(),

    dob: Joi.date(),
    NID: Joi.string()
      .length(16)
      .trim(),

    sex: Joi.string().valid(["m", "f"]),

    location: Joi.object({
      prov_id: Joi.objectId().required(),
      dist_id: Joi.objectId().required(),
      sect_id: Joi.objectId(),
      cell_id: Joi.objectId(),
      village_id: Joi.objectId()
    }),
    status: Joi.number()
      .min(0)
      .max(9),
    approvedBy: Joi.object({
      _id: Joi.objectId().required(),
      name: Joi.string().required()
    }),
    doneById: Joi.objectId().required(),
    // with above doneById, Below now become useless
    lastModifiedBy: Joi.object({
      _id: Joi.objectId().required(),
      name: Joi.string().required()
    }).required(),
    userType: Joi.number(),
    accountExpirationDate: Joi.date()
  };
  return Joi.validate(updateUserData, schema, { convert: true });
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
module.exports.validateBasicUpdate = validateUserUpdate;
module.exports.validateUserUpdateFull = validateUserUpdateFull;
module.exports.validate = validateUser;
module.exports.isEmail = validateEmail;
module.exports.validateLogin = validateLogin;
module.exports.validateToken = validateToken;
module.exports.validateSendMail = validateSendMail;