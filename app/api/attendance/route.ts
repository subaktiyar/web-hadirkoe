import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";

export async function POST(req: Request) {
  try {
    const SERVICE_API_HADIRKOE = process.env.SERVICE_API_HADIRKOE;

    await dbConnect();
    const body = await req.json();

    // Basic validation
    if (!body.employeeId || !body.latitude || !body.longitude) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const attendance = await Attendance.create(body);

    // Sync to external API
    try {
      const externalPayload = {
        NEW_VERSION_DETECTOR: "2.0.0",
        ABSENSI_EMPLOYEE_ID: body.employeeId,
        ABSENSI_LAT: Number(body.latitude),
        ABSENSI_LNG: Number(body.longitude),
        ABSENSI_JNS: body.presenceType,
        ABSENSI_TIPE: body.workType.toUpperCase(),
        ABSENSI_KETERANGAN: body.information,
        // Use Base64 if available, otherwise fallback to URL or empty
        image_uri: body.photoBase64 || body.photoEvidence || "",
      };

      console.log("External sync payload constructed:", externalPayload);

      // if (SERVICE_API_HADIRKOE) {
      //   fetch(SERVICE_API_HADIRKOE, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(externalPayload),
      //   })
      //     .then((res) => res.json())
      //     .then((data) => console.log("External sync success:", data))
      //     .catch((err) => console.error("External sync failed:", err));
      // } else {
      //   console.warn("SERVICE_API_HADIRKOE is not defined, skipping external sync.");
      // }
    } catch (syncError) {
      console.error("External sync error:", syncError);
    }

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
