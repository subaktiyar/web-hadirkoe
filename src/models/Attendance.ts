import mongoose, { Schema, Model, Document } from "mongoose";

export interface IAttendance extends Document {
  apkVersion: string;
  employeeId: string;
  presenceType: string;
  latitude: string;
  longitude: string;
  workType: string;
  information: string;
  createdAt: Date;
}

const AttendanceSchema: Schema = new Schema({
  apkVersion: { type: String, required: true },
  employeeId: { type: String, required: true },
  presenceType: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  workType: { type: String, required: true },
  information: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation error in dev
const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
