import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { selectedPatient } from "@/lib/patient-context";
import { readDb, uploadDir } from "@/lib/store";

export async function GET(request: Request, routeContext: { params: Promise<{ id: string }> }) {
  const context = await selectedPatient();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await routeContext.params;
  const db = await readDb();
  const entry = db.histories.find((item) => item.id === id && item.patientId === context.patient.id);
  if (!entry?.attachment) return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  const content = await fs.readFile(path.join(uploadDir, entry.attachment.storedName));
  const disposition = new URL(request.url).searchParams.has("download") ? "attachment" : "inline";
  return new NextResponse(content, { headers: { "Content-Type": entry.attachment.mimeType, "Content-Disposition": `${disposition}; filename="${entry.attachment.fileName.replaceAll('"', "")}"` } });
}