const config = require("config");
const jwt = require("jsonwebtoken");

const getLoggedInUserId = (token) => {
  const tok = token.substring(7, token.length);
  const { id } = jwt.verify(tok, config.get("app.jwtKey"));
  return id;
};

const getMediaurl = (url) => {
  url = url.replace("\\", "/");
  return `${config.get("app.baseUrl")}/${url}`;
};

module.exports.getLoggedInUserId = getLoggedInUserId;
module.exports.getMediaurl = getMediaurl;
