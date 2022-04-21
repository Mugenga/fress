const express = require("express");
const config = require("config");
const cors = require("cors");
const logger = require("./src/logging");
const api = require("./src/routes");
const app = express();
const mongoCon = require("./src/startup/mongo");
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const path = require("path");

// Disable Powered By Header
app.disable("x-powered-by");

// Allow cors from dev environment
//if (config.get("app.node_env") === "development") {
//allowing cors policies
app.use(cors());
//}

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  express.json({
    limit: "5mb",
  })
);

app.use(express.static(path.join(__dirname, "public"))); //  "public" off of current is root
app.use(bodyParser.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

mongoCon();

// The routes ...

api.mountRoutes(app);

app.listen(port, () =>
  logger.info(`${config.get("app.name")} service is listening on port 3000 !`)
);
