import mongoose, { Schema, models } from "mongoose";

const studentSchema = new Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    school: { type: String, required: true },
    course: { type: String },
    year: { type: String },
    division: { type: String },
    sector: { type: String },
    unit: { type: String },
  },
  { timestamps: true }
);

const Student = models.Student || mongoose.model("Student", studentSchema);

export default Student;
