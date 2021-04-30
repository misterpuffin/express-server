import { Schema } from "mongoose";

const projectSchema = new Schema({
  name: String,
  tasks: [String],
  users: [String],
  dueDate: Date,
});

export default projectSchema;
