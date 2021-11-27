const router = require("express").Router();
const { asyncMiddleware } = require("../middlewares/async");
const _ = require("lodash");
const isJSON = require("is-json");
const { hashPwd, pwdCompare } = require("../tools/hash");
const config = require("config");
const logger = require("../logging");
const { User, validate, validateLogin } = require("../models/user");
const sendmail = require("./sendgrid").sendGrid;
const emailTemplate = require("./emailtemplate").emailTemplate;
const format = require("string-template");

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

module.exports = router;
