import mongoose, { Schema, models } from "mongoose";

/* Executive member of the District Committee with a collection target */
const fundMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    target: { type: Number, required: true, min: 0, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const FundMember =
  models.FundMember || mongoose.model("FundMember", fundMemberSchema);

export default FundMember;
