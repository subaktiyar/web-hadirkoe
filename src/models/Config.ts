import mongoose, { Schema, Model, Document } from "mongoose";

interface ConfigOption {
  value?: string;
  name?: string;
}

export interface IConfig extends Document {
  type: string;
  apkVersion: ConfigOption[];
  presenceType: ConfigOption[];
  workType: ConfigOption[];
  latitude: string;
  longitude: string;
  passKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConfigOptionSchema = new Schema(
  {
    value: { type: String },
    name: { type: String },
  },
  { _id: false }
);

const ConfigSchema: Schema = new Schema(
  {
    type: { type: String, required: true, index: true },
    apkVersion: { type: [ConfigOptionSchema], default: [] },
    presenceType: { type: [ConfigOptionSchema], default: [] },
    workType: { type: [ConfigOptionSchema], default: [] },
    latitude: { type: String },
    longitude: { type: String },
    passKey: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    collection: "configs",
  }
);

// Prevent model recompilation error in dev
const Config: Model<IConfig> = mongoose.models.Config || mongoose.model<IConfig>("Config", ConfigSchema);

export default Config;
