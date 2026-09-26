import mongoose, { Schema, models } from "mongoose";
import Counter from "./Counter";

const legacySchema = new Schema(
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

    designation: {
      type: String,
      default: "izzacode",
    },

    divisionId: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },

    sectorId: {
      type: Schema.Types.ObjectId,
      ref: "Sector",
      required: true,
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
 * Auto Ticket Generation (Prefix: LG)
 * -------------------------------------------------- */
legacySchema.pre("save", async function (next) {
  if (this.ticket) return next();

  const counter = await Counter.findOneAndUpdate(
    { name: "legacyTicket" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  this.ticket = `LG${String(counter.value).padStart(3, "0")}`;
  next();
});

/* ----------------------------------------------------
 * Model Export
 * -------------------------------------------------- */
// Re-register so a schema cached by hot reload (e.g. the old
// required organizationLevel/designation) is never reused.
if (models.Legacy) mongoose.deleteModel("Legacy");

const Legacy = mongoose.model("Legacy", legacySchema);

export default Legacy;
