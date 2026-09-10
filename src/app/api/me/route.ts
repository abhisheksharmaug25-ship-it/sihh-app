import { NextResponse } from "next/server";
import { selectedPatient } from "@/lib/patient-context";
import { readDb } from "@/lib/store";

export async function GET() {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = await readDb();
  const family = db.patients.filter((item) => item.accountId === context.user.accountId);
  return NextResponse.json({ user: { id: context.user.id, email: context.user.email, role: context.user.role }, patient: context.patient, family });
}
