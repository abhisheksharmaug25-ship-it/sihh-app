import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, doctorId, chiefComplaint, clinicalNotes, assessment, treatmentNotes, followUpNotes } = body;
    if (!patientId || !doctorId || !chiefComplaint) return NextResponse.json({ error: "Patient, doctor, and chief complaint are required." }, { status: 400 });
    const consultation = await prisma.consultation.create({ data: { patientId, doctorId, chiefComplaint, clinicalNotes, assessment, treatmentNotes, followUpNotes } });
    return NextResponse.json(consultation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to save consultation." }, { status: 500 });
  }
}
