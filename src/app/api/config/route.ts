import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ConfigForm from "@/models/ConfigForm";

export async function GET() {
  try {
    await dbConnect();

    // Fetch the latest config from config-form collection
    const config = await ConfigForm.findOne({}).sort({ updatedAt: -1 }).lean();

    if (!config) {
      return NextResponse.json({ success: false, error: "Configuration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: config }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}
