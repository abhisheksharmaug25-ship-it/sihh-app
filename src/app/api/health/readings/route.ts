import { NextResponse } from "next/server";
import { selectedPatient } from "@/lib/patient-context";
import { id, readDb, writeDb, type HealthReading } from "@/lib/store";

const kinds = new Set(["sugar", "bp", "weight", "pulse", "temperature"]);
const number = (value: unknown) => Number(value);

export async function GET(request: Request) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const kind = new URL(request.url).searchParams.get("kind");
  const db = await readDb();
  return NextResponse.json(db.readings.filter((reading) => reading.patientId === context.patient.id && (!kind || reading.kind === kind)).sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)));
}

export async function POST(request: Request) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json();
  const kind = String(body.kind ?? "");
  if (!kinds.has(kind) || !String(body.date ?? "") || !String(body.time ?? "")) return NextResponse.json({ error: "Reading type, date, and time are required." }, { status: 400 });
  const reading: HealthReading = { id: id(), patientId: context.patient.id, kind: kind as HealthReading["kind"], date: String(body.date), time: String(body.time), value: body.value === undefined ? undefined : number(body.value), systolic: body.systolic === undefined ? undefined : number(body.systolic), diastolic: body.diastolic === undefined ? undefined : number(body.diastolic), mealContext: body.mealContext ? String(body.mealContext) : undefined, unit: body.unit ? String(body.unit) : undefined, createdAt: new Date().toISOString() };
  if (kind === "sugar" && (!Number.isFinite(reading.value) || reading.value! <= 0)) return NextResponse.json({ error: "Enter a valid blood sugar value." }, { status: 400 });
  if (kind === "bp" && (!Number.isFinite(reading.systolic) || !Number.isFinite(reading.diastolic) || reading.systolic! <= 0 || reading.diastolic! <= 0)) return NextResponse.json({ error: "Enter valid blood pressure values." }, { status: 400 });
  if (["weight", "pulse", "temperature"].includes(kind) && (!Number.isFinite(reading.value) || reading.value! <= 0)) return NextResponse.json({ error: "Enter a valid vital value." }, { status: 400 });
  const db = await readDb(); db.readings.push(reading); await writeDb(db); return NextResponse.json(reading, { status: 201 });
}
