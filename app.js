//Import statements
const express = require("express");
import logger from "winston";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
const mongoose = require("mongoose");

import { config } from "./store/config";
import { applyPassportStrategy } from "./store/passport";
import {
  userController,
  taskController,
  projectController,
} from "./controllers";

//Init Express app
const app = express();

//App dependencies
app.use(cors());
applyPassportStrategy(passport);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Controllers
app.use("/", userController);
app.use("/project", projectController);
app.use("/task", taskController);

//Start app
const { port, mongoDBUri, mongoHostName } = config.env;
app.listen(port, () => {
  logger.info(`App started on port ${port}`);
  mongoose.connect(mongoDBUri, { useUnifiedTopology: true }).then(() => {
    logger.info(`Conneted to mongoDB at ${mongoHostName}`);
  });
});
