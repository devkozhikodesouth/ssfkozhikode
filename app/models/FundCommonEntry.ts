import mongoose, { Schema, models } from "mongoose";
import Counter from "./Counter";

/* Common Collection: contributions not tied to any member or target */
const fundCommonEntrySchema = new Schema(
  {
    contributorName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    mobile: { type: String, default: null, match: /^[0-9]{10}$/ },
    date: { type: Date, required: true },

    // CC-0001, CC-0002 … from an atomic counter: never repeated
    receiptNo: { type: String, unique: true, sparse: true },

    // Client-generated id so a double tap / retry saves only once
    requestId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

fundCommonEntrySchema.pre("save", async function (next) {
  if (this.receiptNo) return next();
  const counter = await Counter.findOneAndUpdate(
    { name: "fundReceiptCommon" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  this.receiptNo = `CC-${String(counter.value).padStart(4, "0")}`;
  next();
});

const FundCommonEntry =
  models.FundCommonEntry || mongoose.model("FundCommonEntry", fundCommonEntrySchema);

export default FundCommonEntry;
