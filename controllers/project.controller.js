import express from "express";
import passport from "passport";
import { Project } from "../database/models";
import { USER_NOT_AUTHORISED, PROJECT_DOES_NOT_EXIST } from "../store/constant";
import { generateServerErrorCode } from "../store/utils";

const projectController = express.Router();

//returns a list of the user's projects
projectController.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Project.find({ users: req.user.email }, (err, result) => {
      res.status(200).json({
        data: result,
      });
    });
  }
);

//creates a new project
projectController.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { name, dueDate } = req.body;
    const data = {
      name,
      dueDate,
      users: [req.user.email],
    };
    new Project(data).save((err, result) => {
      res.status(200).json(result.toJSON());
    });
  }
);

//updates a project
projectController.patch(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { data, id } = req.body;
    const projectToUpdate = await Project.findById(id);
    if (projectToUpdate) {
      if (!projectToUpdate.users.includes(req.user.email)) {
        generateServerErrorCode(
          res,
          403,
          "update project error",
          USER_NOT_AUTHORISED,
          "project"
        );
      } else {
        Object.assign(projectToUpdate, data);
        projectToUpdate.save((err, result) => {
          res.status(200).json(result);
        });
      }
    } else {
      generateServerErrorCode(
        res,
        404,
        "update project error",
        PROJECT_DOES_NOT_EXIST,
        "project"
      );
    }
  }
);

//deletes a project
projectController.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.body;
    const projectToDelete = await Project.findById(id);
    if (projectToDelete) {
      if (!projectToDelete.users.includes(req.user.email)) {
        generateServerErrorCode(
          res,
          403,
          "delete project error",
          USER_NOT_AUTHORISED,
          "project"
        );
      } else {
        projectToDelete.users.pull(req.user.email);
        if (!(projectToDelete.users.length === 0)) {
          await projectToDelete.save();
        } else {
          await projectToDelete.deleteOne();
        }
        Project.find({ users: req.user.email }, (err, result) => {
          res.status(200).json({
            data: result,
          });
        });
      }
    } else {
      generateServerErrorCode(
        res,
        404,
        "update project error",
        PROJECT_DOES_NOT_EXIST,
        "project"
      );
    }
  }
);

export default projectController;
