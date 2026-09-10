import { NextResponse } from "next/server";
import path from "node:path";
import { selectedPatient } from "@/lib/patient-context";
import { deleteDocumentFile, saveDocumentFile } from "@/lib/storage";
import { id, readDb, writeDb, type DocumentCategory } from "@/lib/store";

const allowed = new Map([["application/pdf", "OTHER"], ["image/jpeg", "OTHER"], ["image/png", "OTHER"]]);
const categories = new Set(["PRESCRIPTION", "LAB_REPORT", "MEDICAL_REPORT", "OTHER"]);

export async function GET() {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = await readDb();
  return NextResponse.json(db.documents.filter((document) => document.patientId === context.patient.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(request: Request) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  if (!allowed.has(file.type) || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Only PDF, JPG, JPEG, and PNG files up to 10 MB are supported." }, { status: 415 });
  const documentId = id();
  const extension = path.extname(file.name).toLowerCase() || ".bin";
  const storedName = `${documentId}${extension}`;
  await saveDocumentFile(storedName, Buffer.from(await file.arrayBuffer()), file.type);
  const db = await readDb();
  const document = { id: documentId, patientId: context.patient.id, category: (categories.has(String(form.get("category"))) ? String(form.get("category")) : allowed.get(file.type)) as DocumentCategory, fileName: file.name, storedName, mimeType: file.type, size: file.size, createdAt: new Date().toISOString() };
  db.documents.push(document);
  await writeDb(db);
  return NextResponse.json(document, { status: 201 });
}

export async function DELETE(request: Request) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const documentId = new URL(request.url).searchParams.get("id");
  const db = await readDb();
  const document = db.documents.find((item) => item.id === documentId && item.patientId === context.patient.id);
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  await deleteDocumentFile(document.storedName);
  db.documents = db.documents.filter((item) => item.id !== document.id);
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
