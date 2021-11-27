const express = require('express');
const config = require('config');
const cors = require('cors');
const logger = require('./src/logging');
const api = require('./src/routes');
const app = express();
const mongoCon = require('./src/startup/mongo');
const bodyParser = require("body-parser");

// Disable Powered By Header
app.disable('x-powered-by');

// Allow cors from dev environment
if (config.get('app.node_env') === 'development') {
  //allowing cors policies
  app.use(cors());
}

app.use(
  express.json({
    limit: '5mb'
  })
);
app.use(express.static("./public"));
app.use(bodyParser.json({limit: "20mb"}));
app.use(express.urlencoded({ extended: true }));

mongoCon();

// The routes ...

api.mountRoutes(app);
// app.use(
//   fileUpload({
//     limits: { fileSize: 50 * 1024 * 1024 }
//   })
// );

app.listen(3000, () =>
  logger.info(
    `${config.get('app.name')} service is listening on port 3000 !`
  )
);
