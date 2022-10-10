const config = require("config");
const isJSON = require("is-json");
const logger = require("../logging");
const router = require("express").Router();
const { asyncMiddleware } = require("../middlewares/async");
const { pwdCompare } = require("../tools/hash");
const { User, validate, validateLogin } = require("../models/user");
const _ = require("lodash");
const speakeasy = require("speakeasy");
const { sendSMS } = require('../services/sms.service');

router.post(
  "/otp",
  asyncMiddleware(async (req, res) => {
    //Check if a valid json object is provided
    if (!isJSON(JSON.stringify(req.body)))
      return res
        .status(400)
        .send({ status: 400, errors: ["Investigate your body request."] });

    //validate input  data
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({
        status: 400,
        errors: [error.details[0].message],
      });

    const secret = speakeasy.generateSecret({ length: 20 });

    // Check if user exisits

    const userExist = await User.findOne({
      phone_number: req.body.phone_number,
    });

    const token = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });

    const smsData = {
      "recipient": req.body.phone_number,
      "sender_id": "AutoAssist",
      "message": "Your code to login to the AutoAssist app is: " + token
    }

    if (!userExist) {
      let user = new User({ ...req.body, otp_secret: secret.base32 });
      user = await user.save();

      // Send SMS
      await sendSMS(smsData);
      return res.status(200).send({
        status: 200,
        data: user,
        message: "successful",
      });
    } else {
      userExist.otp_secret = secret.base32;
      userExist.save();
      // Send SMS
      await sendSMS(smsData);
      
      return res.status(200).send({
        status: 200,
        data: userExist,
        message: "successful",
      });
    }
  })
);

/*** Login  */
router.post("/authenticate", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error)
    return res.status(400).send({
      status: 400,
      errors: [error.details[0].message],
    });
  try {
    // check if email exists, email is validated and Max tries is <= 4
    let user = await User.findOne({ email: req.body.phone_number });
    // If a user doesn't exist

    if (!user)
      return res.status(400).send({
        status: 400,
        errors: ["Invalid email or Password."],
      });

    //compare password
    const validPassword = await pwdCompare(
      req.body.password + user.email,
      user.password
    );

    const tokenValidates = speakeasy.totp.verify({
      secret: user.otp_secret,
      encoding: 'base32',
      token: req.body.otp,
      window: 6
    });

    if (!tokenValidates) {
      return res.status(400).send({
        status: 400,
        errors: ["Invalid OTP"],
      });
    }

    // Generate JWT
    const token = user.generateAuthToken(
      config.get("app.jwtKeyExpirationTime")
    );

    return res
      .status(200)
      .send({
        status: 200,
        data: {
          user: user,
          token: token
        },
        message: "Login Successful!",
      });
  } catch (error) {
    logger.error(error);
    return res.status(401).send({
      status: 401,
      errors: ["Sorry, we got difficulties to login you."],
    });
  }
});

module.exports = router;
