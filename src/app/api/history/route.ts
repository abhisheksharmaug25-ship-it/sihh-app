import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { selectedPatient } from "@/lib/patient-context";
import { id, readDb, uploadDir, writeDb } from "@/lib/store";

export async function GET() {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = await readDb();
  return NextResponse.json(db.histories.filter((entry) => entry.patientId === context.patient.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(request: Request) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const form = await request.formData();
  const title = String(form.get("title") ?? "");
  const type = String(form.get("type") ?? "");
  if (!title.trim() || !type.trim()) return NextResponse.json({ error: "Type and title are required." }, { status: 400 });
  const file = form.get("file");
  const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
  if (file instanceof File && (!allowedTypes.has(file.type) || file.size > 10 * 1024 * 1024)) return NextResponse.json({ error: "Only PDF, JPG, JPEG, and PNG files up to 10 MB are supported." }, { status: 415 });
  const db = await readDb();
  const attachment = file instanceof File ? { storedName: `${id()}${path.extname(file.name).toLowerCase() || ".bin"}`, fileName: file.name, mimeType: file.type, size: file.size } : undefined;
  if (file instanceof File && attachment) await fs.writeFile(path.join(uploadDir, attachment.storedName), Buffer.from(await file.arrayBuffer()));
  const entry = { id: id(), patientId: context.patient.id, type, title, description: String(form.get("description") ?? ""), eventDate: String(form.get("eventDate") ?? ""), attachment, createdAt: new Date().toISOString() };
  db.histories.push(entry);
  await writeDb(db);
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: Request) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const idToDelete = new URL(request.url).searchParams.get("id");
  const db = await readDb();
  const entry = db.histories.find((item) => item.id === idToDelete && item.patientId === context.patient.id);
  if (entry?.attachment) await fs.rm(path.join(uploadDir, entry.attachment.storedName), { force: true });
  db.histories = db.histories.filter((entry) => !(entry.id === idToDelete && entry.patientId === context.patient.id));
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
