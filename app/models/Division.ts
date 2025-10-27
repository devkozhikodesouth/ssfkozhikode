import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * @interface IDivision
 * Represents a division document in MongoDB.
 */
export interface IDivision extends Document {
  divisionName: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Division Schema
 * Automatically manages createdAt and updatedAt timestamps.
 */
const DivisionSchema: Schema<IDivision> = new Schema(
  {
    divisionName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

/**
 * Division Model
 * Prevents model overwrite errors in development (Next.js hot reload fix).
 */
const Division: Model<IDivision> =
  mongoose.models.Division || mongoose.model<IDivision>("Division", DivisionSchema);

export default Division;
        