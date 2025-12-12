import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename || !request.body) {
    return NextResponse.json({ error: "Filename and body are required" }, { status: 400 });
  }

  // Validate file extension
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i.test(filename);
  if (!isImage) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: "public",
      token: process.env.HADIRKOE_READ_WRITE_TOKEN,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
