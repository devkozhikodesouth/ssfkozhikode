import mongoose, { Schema, models } from "mongoose";

const studentSchema = new Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    school: { type: String, required: true },
    course: { type: String },
    year: { type: String },

    // Changed from String to ObjectId
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "Unit", // 👈 reference to the Unit collection
      required: true, // make true if every student must belong to a unit
    },
  },
  { timestamps: true }
);

const Student = models.Student || mongoose.model("Student", studentSchema);

export default Student;