import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // Basic validation
    if (!body.employeeId || !body.latitude || !body.longitude) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const attendance = await Attendance.create(body);

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
