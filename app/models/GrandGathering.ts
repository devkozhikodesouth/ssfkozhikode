import mongoose, { Schema, models } from "mongoose";
import Counter from "./Counter";

const grandGatheringSchema = new Schema(
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
grandGatheringSchema.pre("validate", function (next) {
  if (this.organizationLevel === "sector" && !this.sectorId) {
    this.invalidate("sectorId", "Sector is required for sector-level members");
  }
  next();
});

/* ----------------------------------------------------
 * Auto Ticket Generation (Prefix: GG)
 * -------------------------------------------------- */
grandGatheringSchema.pre("save", async function (next) {
  if (this.ticket) return next();

  const counter = await Counter.findOneAndUpdate(
    { name: "grandGatheringTicket" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  this.ticket = `GG${String(counter.value).padStart(3, "0")}`;
  next();
});

/* ----------------------------------------------------
 * Model Export
 * -------------------------------------------------- */
const GrandGathering =
  models.GrandGathering ||
  mongoose.model("GrandGathering", grandGatheringSchema);

export default GrandGathering;
