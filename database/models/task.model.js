import mongoose from "mongoose";
import taskSchema from "../schemas/task.schema";

const Task = mongoose.model("Task", taskSchema);

export default Task;
