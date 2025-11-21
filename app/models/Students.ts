import mongoose, { Schema, models } from "mongoose";
import Counter from "./Counter";
const studentSchema = new Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    school: { type: String, required: true },
    course: { type: String },
    year: { type: String },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    attendance: { type: Boolean, default: false },

    ticket: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Auto ticket generation
studentSchema.pre("save", async function (next) {
  if (this.ticket && this.ticket !== "") return next();  // skip if provided

  const counter = await Counter.findOneAndUpdate(
    { name: "ticket" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  this.ticket = `KS${String(counter.value).padStart(3, "0")}`;
  next();
});

const Student = models.Student || mongoose.model("Student", studentSchema);
export default Student;
