import { NextResponse } from "next/server";
import { selectedPatient } from "@/lib/patient-context";
import { readDb, writeDb } from "@/lib/store";

export async function PUT(request: Request) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json();
  if (!String(body.fullName ?? "").trim()) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  const db = await readDb();
  const patient = db.patients.find((item) => item.id === context.patient.id && item.accountId === context.user.accountId);
  if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  const fields = ["fullName", "dateOfBirth", "gender", "phone", "bloodGroup", "allergies", "emergencyContact", "address", "city", "state", "pincode", "currentMedicines", "majorConditions"] as const;
  for (const field of fields) if (body[field] !== undefined) patient[field] = String(body[field] ?? "");
  patient.updatedAt = new Date().toISOString();
  await writeDb(db);
  return NextResponse.json({ patient });
}
