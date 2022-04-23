const authorized = require("../middlewares/authorization").isAuthorized;
const base64Img = require("base64-img");
const config = require("config");
const emailTemplate = require("./emailtemplate").emailTemplate;
const format = require("string-template");
const isJSON = require("is-json");
const logger = require("../logging");
const router = require("express").Router();
const sendmail = require("./sendgrid").sendGrid;
const { asyncMiddleware } = require("../middlewares/async");
const { hashPwd, pwdCompare } = require("../tools/hash");
const { getLoggedInUserId, getMediaurl } = require("../tools/common");
const { ObjectID } = require("mongodb");
const { User, validate, validateLogin } = require("../models/user");
const _ = require("lodash");

router.post(
  "/",
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

    let user = new User(
      _.pick(req.body, [
        "foreName",
        "surname",
        "email",
        "password",
        "sex",
        "status",
      ])
    );

    user.password = await hashPwd(
      config.get("app.saltRounds"),
      req.body.password + req.body.email
    );

    user = await user.save();

    // TO:DO Send Email

    // send account activation email to the user
    await sendmail(
      req.body.email,
      emailTemplate.activateAccount.subject,
      format("" + emailTemplate.activateAccount.emailBody, {
        username: req.body.foreName,
        email: req.body.email,
      })
    );

    return res.status(200).send({
      status: 200,
      content: _.pick(user, ["_id", "foreName", "surname", "email", "status"]),
      message: "successful",
    });
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
    let user = await User.findOne({ email: req.body.email });
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

    if (!validPassword) {
      return res.status(400).send({
        status: 400,
        errors: ["Invalid email or Password"],
      });
    }

    // Generate JWT
    const token = user.generateAuthToken(
      config.get("app.jwtKeyExpirationTime")
    );
    //Send response on successful login
    process.env.NODE_ENV == "development" ? logger.info(user) : "";

    return res
      .status(200)
      .header("x-auth-token", token)
      .send({
        status: 200,
        content: {
          info: _.pick(user, ["surname", "foreName", "email", "_id"]),
          token: token, // Should be remove from body
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

// Get LoggedIn User
router.get(
  "/",
  authorized,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(
      ObjectID(getLoggedInUserId(req.header("x-auth-token")))
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
    const user = await User.findById();
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
    const userId = ObjectID(getLoggedInUserId(req.header("x-auth-token")));
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

module.exports = router;
