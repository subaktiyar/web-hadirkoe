import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Config from "@/models/Config";

export async function POST(request: Request) {
  try {
    const { passKey } = await request.json();

    if (!passKey) {
      return NextResponse.json({ success: false, error: "PassKey is required" }, { status: 400 });
    }

    await dbConnect();

    // Fetch the OTP config
    const config = await Config.findOne({ type: "passKey" }).lean();

    if (!config || !config.passKey) {
      // Fallback or error if config not set.
      // For security, if no OTP is set, maybe we should deny access or allow?
      // Let's assume deny if not configured for now, or maybe the user wants a default.
      // Based on request, user implies config exists.
      return NextResponse.json({ success: false, error: "PassKey Configuration not found" }, { status: 404 });
    }

    if (passKey !== config.passKey) {
      return NextResponse.json({ success: false, error: "Invalid PassKey" }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: "PassKey Validated" }, { status: 200 });
  } catch (error: any) {
    console.error("PassKey Validation Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
