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
<<<<<<< HEAD
          user: user,
          token: token
=======
          info: _.pick(user, ["surname", "foreName", "email", "_id"]),
          token: token, // Should be remove from body
>>>>>>> d1bc18ee4d516b7befde78d9addfc491c1ab1b39
        },
        token: token, // Should be remove from body
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

<<<<<<< HEAD
=======
// Get LoggedIn User
router.get(
  "/",
  authorized,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(
      ObjectID(getLoggedInUserId(req.header("Authorization")))
    );
    user.profile_url = user.profile_url ? getMediaurl(user.profile_url) : "";
    return res.status(200).send({
      status: 200,
      user,
      message: "successful",
    });
  })
);

router.get(
  "/all",
  asyncMiddleware(async (req, res) => {
    const user = await User.find();
    return res.status(200).send({
      status: 200,
      user,
      message: "successful",
    });
  })
);

// Edit User/Uploading Profile Picture
router.put(
  "/",
  authorized,
  asyncMiddleware(async (req, res) => {
    const userId = ObjectID(getLoggedInUserId(req.header("Authorization")));
    const user = await User.findById(userId);

    if (user) {
      const image = req.body.media;
      if (image) {
        base64Img.img(
          image,
          "./public/profiles",
          Date.now(),
          async function (err, filePath) {
            if (err) return res.send(500, { error: err });
            const pathArr = filePath.split("/public");
            const filename = pathArr[pathArr.length - 1];
            console.log(filename);
            req.body.profile_url =
              filename.split("/")[1] + "/" + filename.split("/")[2];

            User.findOneAndUpdate(
              { _id: userId },
              { $set: req.body },
              { new: true },
              function (err, doc) {
                if (err) return res.send(500, { error: err });
                doc.profile_url = getMediaurl(doc.profile_url);
                return res.status(200).send({
                  status: 200,
                  post: doc,
                  message: "successful",
                });
              }
            );
          }
        );
      } else {
        User.findOneAndUpdate(
          { _id: userId },
          { $set: req.body },
          { new: true },
          function (err, doc) {
            if (err) return res.send(500, { error: err });
            doc.profile_url = getMediaurl(doc.profile_url);
            return res.status(200).send({
              status: 200,
              post: doc,
              message: "successful",
            });
          }
        );
      }
    } else {
      return res.status(404).send({
        status: 404,
        message: "User not found",
      });
    }
  })
);

>>>>>>> d1bc18ee4d516b7befde78d9addfc491c1ab1b39
module.exports = router;
