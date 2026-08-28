import mongoose, { Schema, models } from "mongoose";
import Counter from "./Counter";

const grandConclave26Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
      unique: true,
      index: true,
    },

    organizationLevel: {
      type: String,
      enum: ["sector", "division", "district"],
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },

    divisionId: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      default: null,
    },

    sectorId: {
      type: Schema.Types.ObjectId,
      ref: "Sector",
      default: null,
    },

    attendance: {
      type: Boolean,
      default: false,
    },

    ticket: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

/* ----------------------------------------------------
 * Conditional Validation
 * -------------------------------------------------- */
grandConclave26Schema.pre("validate", function (next) {
  if (this.organizationLevel === "sector" && !this.sectorId) {
    this.invalidate("sectorId", "Sector is required for sector-level members");
  }
  next();
});

/* ----------------------------------------------------
 * Auto Ticket Generation (Prefix: GC26)
 * -------------------------------------------------- */
grandConclave26Schema.pre("save", async function (next) {
  if (this.ticket) return next();

  const counter = await Counter.findOneAndUpdate(
    { name: "grandConclave26Ticket" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  this.ticket = `GC26${String(counter.value).padStart(3, "0")}`;
  next();
});

/* ----------------------------------------------------
 * Model Export
 * -------------------------------------------------- */
const GrandConclave26 =
  models.GrandConclave26 ||
  mongoose.model("GrandConclave26", grandConclave26Schema);

export default GrandConclave26;
