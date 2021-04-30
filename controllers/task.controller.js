import express from "express";
import { Task } from "../database/models";

const taskController = express.Router();

taskController.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Task.find({ users: req.user.email }, (err, result) => {
      res.status(200).json({ data: result });
    });
  }
);

taskController.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { name, projectId, dueDate } = req.body;
    const data = {
      name,
      projectId,
      dueDate,
      users: [req.user.email],
    };
    new Task(data).save((err, result) => {
      res.status(200).json(result.toJSON());
    });
  }
);

taskController.patch(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {}
);

taskController.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {}
);

export default taskController;
