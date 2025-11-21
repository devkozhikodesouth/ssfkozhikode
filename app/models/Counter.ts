import mongoose, { Schema, models } from "mongoose";

const counterSchema = new Schema(
  {
    name: { type: String, required: true, unique: true ,default: 'ticket'},
    value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Counter = models.Counter || mongoose.model("Counter", counterSchema);

export default Counter;
