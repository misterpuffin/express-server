import mongoose from "mongoose";
import projectSchema from "../schemas/project.schema";

const Project = mongoose.model("Project", projectSchema);

export default Project;
