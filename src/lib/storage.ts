import { promises as fs } from "node:fs";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { uploadDir } from "@/lib/store";

// On Vercel, set BLOB_READ_WRITE_TOKEN (Vercel Blob store). Locally, files fall back to public/uploads.
export function blobStorageEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveDocumentFile(storedName: string, data: Buffer, contentType: string): Promise<void> {
  if (blobStorageEnabled()) {
    await put(storedName, data, { access: "public", contentType, addRandomSuffix: false });
    return;
  }
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, storedName), data);
}

export async function readDocumentFile(storedName: string): Promise<Buffer> {
  if (blobStorageEnabled()) {
    const response = await fetch(`${process.env.BLOB_STORE_URL ?? "https://blob.vercel-storage.com"}/${storedName}`);
    if (!response.ok) throw new Error(`Blob fetch failed: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }
  return fs.readFile(path.join(uploadDir, storedName));
}

export async function deleteDocumentFile(storedName: string): Promise<void> {
  if (blobStorageEnabled()) {
    await del(storedName);
    return;
  }
  await fs.rm(path.join(uploadDir, storedName), { force: true });
}
