import mongoose, { Schema, Model, Document } from "mongoose";

export interface IConfigPassKey extends Document {
  passKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConfigPassKeySchema: Schema = new Schema(
  {
    passKey: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    collection: "config-passkey",
  }
);

// Prevent model recompilation error in dev
const ConfigPassKey: Model<IConfigPassKey> = mongoose.models.ConfigPassKey || mongoose.model<IConfigPassKey>("ConfigPassKey", ConfigPassKeySchema);

export default ConfigPassKey;
