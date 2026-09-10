import { NextResponse } from "next/server";
import { selectedPatient } from "@/lib/patient-context";
import { id, readDb, writeDb, type Medicine } from "@/lib/store";

export async function GET() {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = await readDb(); return NextResponse.json(db.medicines.filter((medicine) => medicine.patientId === context.patient.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(request: Request) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json();
  if (!String(body.name ?? "").trim() || !String(body.dosage ?? "").trim() || !String(body.frequency ?? "").trim() || !String(body.startDate ?? "").trim()) return NextResponse.json({ error: "Name, dosage, frequency, and start date are required." }, { status: 400 });
  const now = new Date().toISOString(); const medicine: Medicine = { id: id(), patientId: context.patient.id, name: String(body.name), dosage: String(body.dosage), frequency: String(body.frequency), startDate: String(body.startDate), endDate: String(body.endDate ?? ""), instructions: String(body.instructions ?? ""), createdAt: now, updatedAt: now };
  const db = await readDb(); db.medicines.push(medicine); await writeDb(db); return NextResponse.json(medicine, { status: 201 });
}

export async function PUT(request: Request) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json(); const db = await readDb(); const medicine = db.medicines.find((item) => item.id === body.id && item.patientId === context.patient.id);
  if (!medicine) return NextResponse.json({ error: "Medicine not found." }, { status: 404 });
  for (const field of ["name", "dosage", "frequency", "startDate", "endDate", "instructions"] as const) if (body[field] !== undefined) medicine[field] = String(body[field]); medicine.updatedAt = new Date().toISOString(); await writeDb(db); return NextResponse.json(medicine);
}

export async function DELETE(request: Request) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const idToDelete = new URL(request.url).searchParams.get("id"); const db = await readDb(); db.medicines = db.medicines.filter((item) => !(item.id === idToDelete && item.patientId === context.patient.id)); await writeDb(db); return NextResponse.json({ ok: true });
}
