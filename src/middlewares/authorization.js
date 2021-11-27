const config = require("config");
const logger = require("../logging");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

/**** JWT Authorization Middleware */
module.exports.isAuthorized = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .send({ status: 401, errors: ["Access denied. Invalid token."] });

  try {
    const { id } = jwt.verify(token, config.get("app.jwtKey"));

    const { _id } = await User.findById(id); // Find an other way to resolve this issue of hitting database
    next()
  } catch (error) {
    logger.warn({ authorization_err: error });
    return res
      .status(401)
      .send({ status: 401, errors: ["Unauthorized access."] });
  }
};
