import mongoose, { Schema, models } from "mongoose";

/* Small key/value store for switches the admin can flip without a redeploy */
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

const Setting = models.Setting || mongoose.model("Setting", settingSchema);

export default Setting;
