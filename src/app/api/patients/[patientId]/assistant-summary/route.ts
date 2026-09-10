import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { readDb } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ patientId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { patientId } = await context.params;
  const db = await readDb();
  const patient = db.patients.find((item) => item.id === patientId);
  if (!patient || (user.role === "PATIENT" && patient.accountId !== user.accountId)) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  const summaries = db.preConsultationSummaries.filter((summary) => summary.patientId === patient.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ patient: { id: patient.id, patientId: patient.patientId, fullName: patient.fullName }, summaries });
}