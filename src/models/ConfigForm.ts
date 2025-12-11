import mongoose, { Schema, Model, Document } from "mongoose";

interface ConfigOption {
  value?: string;
  name?: string;
}

export interface IConfigForm extends Document {
  apkVersion: ConfigOption[];
  presenceType: ConfigOption[];
  workType: ConfigOption[];
  latitude: string;
  longitude: string;
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

const ConfigFormSchema: Schema = new Schema(
  {
    apkVersion: { type: [ConfigOptionSchema], default: [] },
    presenceType: { type: [ConfigOptionSchema], default: [] },
    workType: { type: [ConfigOptionSchema], default: [] },
    latitude: { type: String },
    longitude: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    collection: "config-form",
  }
);

// Prevent model recompilation error in dev
const ConfigForm: Model<IConfigForm> = mongoose.models.ConfigForm || mongoose.model<IConfigForm>("ConfigForm", ConfigFormSchema);

export default ConfigForm;
