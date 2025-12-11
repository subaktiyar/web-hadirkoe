import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Config from "@/models/Config";

export async function GET() {
  try {
    await dbConnect();

    // Fetch the latest config with type='form'
    const config = await Config.findOne({ type: "form" }).sort({ updatedAt: -1 }).lean();

    if (!config) {
      return NextResponse.json({ success: false, error: "Configuration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: config }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}
