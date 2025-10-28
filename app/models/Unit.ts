import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUnit extends Document {
  divisionId: mongoose.Types.ObjectId;
  sectorId: mongoose.Types.ObjectId;
  unitName: string;
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema: Schema = new Schema(
  {
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
    unitName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Unit: Model<IUnit> =
  mongoose.models.Unit || mongoose.model<IUnit>("Unit", UnitSchema);

export default Unit;
