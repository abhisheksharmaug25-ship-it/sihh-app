import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { readDocumentFile } from "@/lib/storage";
import { readDb } from "@/lib/store";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user?.patientId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await context.params;
  const db = await readDb();
  const document = db.documents.find((item) => item.id === id && item.patientId === user.patientId);
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const content = await readDocumentFile(document.storedName);
  const disposition = new URL(request.url).searchParams.has("download") ? "attachment" : "inline";
  return new NextResponse(new Uint8Array(content), { headers: { "Content-Type": document.mimeType, "Content-Disposition": `${disposition}; filename="${document.fileName.replaceAll('"', "")}"` } });
}
