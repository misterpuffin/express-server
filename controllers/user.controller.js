const express = require("express");
import jwt from "jsonwebtoken";
import passport from "passport";
import { validationResult } from "express-validator";
import { config } from "../store/config";
import {
  generateHashedPassword,
  generateServerErrorCode,
  registerValidation,
  loginValidation,
} from "../store/utils";
import {
  SOME_THING_WENT_WRONG,
  USER_EXISTS_ALREADY,
  WRONG_PASSWORD,
  USER_DOES_NOT_EXIST,
} from "../store/constant";
import { User } from "../database/models";

const userController = express.Router();

function createUser(email, password) {
  const data = {
    email,
    hashedPassword: generateHashedPassword(password),
  };
  return new User(data).save();
}

userController.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.find({}, (err, result) => {
      res.status(200).json({
        data: result,
      });
    });
  }
);

userController.post("/register", registerValidation, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        await createUser(email, password);
        // Sign token
        const newUser = await User.findOne({ email });
        const token = jwt.sign({ email }, config.passport.secret, {
          expiresIn: 10000000,
        });
        const userToReturn = { ...newUser.toJSON(), ...{ token } };
        delete userToReturn.hashedPassword;
        res.status(200).json(userToReturn);
      } else {
        generateServerErrorCode(
          res,
          403,
          "register email error",
          USER_EXISTS_ALREADY,
          "email"
        );
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
});

userController.post("/login", loginValidation, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user && user.email) {
        const isPasswordMatched = user.comparePassword(password);
        if (isPasswordMatched) {
          // Sign token
          const token = jwt.sign({ email }, config.passport.secret, {
            expiresIn: 1000000,
          });
          const userToReturn = { ...user.toJSON(), ...{ token } };
          delete userToReturn.hashedPassword;
          res.status(200).json(userToReturn);
        } else {
          generateServerErrorCode(
            res,
            403,
            "login password error",
            WRONG_PASSWORD,
            "password"
          );
        }
      } else {
        generateServerErrorCode(
          res,
          404,
          "login email error",
          USER_DOES_NOT_EXIST,
          "email"
        );
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
});

userController.get("/logout", (req, res) => {
  req.logout();
});

export default userController;
