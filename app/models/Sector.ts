import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISector extends Document {
  divisionId: mongoose.Types.ObjectId;
  sectorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const SectorSchema: Schema = new Schema(
  {
    divisionId: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },
    sectorName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Sector: Model<ISector> =
  mongoose.models.Sector || mongoose.model<ISector>("Sector", SectorSchema);

export default Sector;
