import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "A document file is required." }, { status: 400 });
  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Only PDF, JPG, JPEG, and PNG files are supported." }, { status: 415 });
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return NextResponse.json({ status: "REVIEW_REQUIRED", message: "Information could not be reliably extracted.", extractedData: {} });
  return NextResponse.json({ status: "REVIEW_REQUIRED", message: "Review the extracted information before saving.", extractedData: { documentType: "Unknown", date: null, doctorName: null, medicines: [], tests: [] } });
}
