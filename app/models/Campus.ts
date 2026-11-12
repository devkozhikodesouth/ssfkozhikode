import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICampus extends Document {
  name: string;
  divisionId: Types.ObjectId;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CampusSchema: Schema<ICampus> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    divisionId: { type: Schema.Types.ObjectId, ref: "Division", required: true, index: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  // Explicit collection: mongoose would otherwise pluralise "Campus" to "campus"
  { timestamps: true, collection: "campuses" }
);

// A campus name is unique within its division
CampusSchema.index({ divisionId: 1, name: 1 }, { unique: true });

// Re-register so a schema cached by hot reload (old collection name) is never reused.
if (mongoose.models.Campus) mongoose.deleteModel("Campus");

const Campus: Model<ICampus> = mongoose.model<ICampus>("Campus", CampusSchema);

export default Campus;
