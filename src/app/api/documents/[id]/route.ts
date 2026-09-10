import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { currentUser } from "@/lib/auth";
import { readDb, uploadDir } from "@/lib/store";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user?.patientId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await context.params;
  const db = await readDb();
  const document = db.documents.find((item) => item.id === id && item.patientId === user.patientId);
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const content = await fs.readFile(path.join(uploadDir, document.storedName));
  const disposition = new URL(request.url).searchParams.has("download") ? "attachment" : "inline";
  return new NextResponse(content, { headers: { "Content-Type": document.mimeType, "Content-Disposition": `${disposition}; filename="${document.fileName.replaceAll('"', "")}"` } });
}
