import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hospitalCount = await prisma.hospital.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    return NextResponse.json({ ok: true, hospitalCount, patientCount, doctorCount });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
  }
}
