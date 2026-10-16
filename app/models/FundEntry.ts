import mongoose, { Schema, models } from "mongoose";
import Counter from "./Counter";

const fundEntrySchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "FundMember",
      required: true,
      index: true,
    },
    contributorName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    mobile: { type: String, default: null, match: /^[0-9]{10}$/ },
    date: { type: Date, required: true },

    // FC-0001, FC-0002 … from an atomic counter: never repeated
    receiptNo: { type: String, unique: true, sparse: true },

    // Client-generated id so a double tap / network retry saves only once
    requestId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

fundEntrySchema.pre("save", async function (next) {
  if (this.receiptNo) return next();

  const counter = await Counter.findOneAndUpdate(
    { name: "fundReceipt" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  this.receiptNo = `FC-${String(counter.value).padStart(4, "0")}`;
  next();
});

const FundEntry = models.FundEntry || mongoose.model("FundEntry", fundEntrySchema);

export default FundEntry;
