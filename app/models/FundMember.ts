import mongoose, { Schema, models } from "mongoose";

/* Committee member with a collection target, in the Executive or Executive Council challenge */
const fundMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    target: { type: Number, required: true, min: 0, default: 0 },
    active: { type: Boolean, default: true },
    // Older members have no group and count as "executive"
    group: { type: String, enum: ["executive", "council"], default: "executive", index: true },
  },
  { timestamps: true }
);

fundMemberSchema.index({ group: 1, name: 1 }, { unique: true });

const FundMember =
  models.FundMember || mongoose.model("FundMember", fundMemberSchema);

export default FundMember;
