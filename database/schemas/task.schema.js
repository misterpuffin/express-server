import { Schema } from "mongoose";

const taskSchema = new Schema({
  name: String,
  projectId: String,
  users: [String],
  dueDate: Date,
});

export default taskSchema;
