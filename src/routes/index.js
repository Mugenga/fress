/* eslint-disable max-len */
const authorized = require("../middlewares/authorization").isAuthorized;
const error = require("../middlewares/error");
const user = require("../controllers/users");
const post = require("../controllers/posts");
const index = require("../controllers/index");

const mountRoutes = (app) => {
  // Intercept body JSON error to overwrite the existing error message
  app.use((error, req, res, next) => {
    if (
      error instanceof SyntaxError &&
      error.status === 400 &&
      "body" in error
    ) {
      logger.error(error);
      next();
    } else next();
  });

  app.use("/", index);
  app.use("/users", user);
  app.use("/posts", authorized, post);

  // Call error handling at the end
  app.use(error);
};

module.exports = {
  mountRoutes,
};
