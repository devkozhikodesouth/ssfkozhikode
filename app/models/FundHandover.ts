import mongoose, { Schema, models } from "mongoose";

/* Cash a member handed over to the admin (paid in) */
const fundHandoverSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "FundMember", required: true, index: true },
    group: { type: String, enum: ["executive", "council"], required: true },
    amount: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

const FundHandover = models.FundHandover || mongoose.model("FundHandover", fundHandoverSchema);

export default FundHandover;
