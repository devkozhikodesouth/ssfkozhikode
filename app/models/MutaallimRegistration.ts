import mongoose, { Schema, Document, Model, Types } from "mongoose";
import Counter from "./Counter";
import { CATEGORIES } from "@/app/utils/mutaallim";

export interface IMutaallimRegistration extends Document {
  registrationCode: string;
  divisionId: Types.ObjectId;
  campusId: Types.ObjectId;
  name: string;
  place: string;
  phone: string;
  category: (typeof CATEGORIES)[number];
  createdAt: Date;
}

const RegistrationSchema: Schema<IMutaallimRegistration> = new Schema(
  {
    // Human-readable unique code (MUT-0001), assigned on first save
    registrationCode: { type: String, unique: true, sparse: true },
    divisionId: { type: Schema.Types.ObjectId, ref: "Division", required: true, index: true },
    campusId: { type: Schema.Types.ObjectId, ref: "Campus", required: true, index: true },
    name: { type: String, required: true, trim: true },
    place: { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One registration per phone number for the whole event
RegistrationSchema.index({ phone: 1 }, { unique: true });

/* Sequential code from an atomic counter: MUT-0001, MUT-0002 … The unique
 * index on registrationCode is the backstop against any collision. */
RegistrationSchema.pre("save", async function () {
  if (this.registrationCode) return;
  const counter = await Counter.findOneAndUpdate(
    { name: "mutaallimCode" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  this.registrationCode = `MUT-${String(counter.value).padStart(4, "0")}`;
});

// Re-register so a schema cached by hot reload is never reused.
if (mongoose.models.MutaallimRegistration) mongoose.deleteModel("MutaallimRegistration");

const MutaallimRegistration: Model<IMutaallimRegistration> =
  mongoose.model<IMutaallimRegistration>("MutaallimRegistration", RegistrationSchema);

export default MutaallimRegistration;
