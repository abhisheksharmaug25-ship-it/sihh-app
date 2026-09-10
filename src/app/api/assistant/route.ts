import { NextResponse } from "next/server";
import { selectedPatient } from "@/lib/patient-context";
import { id, readDb, writeDb } from "@/lib/store";

const systemPrompt = "You are a medical pre-consultation information organizer. Ask one relevant follow-up question at a time. Always respond in English unless the patient writes in another language. Never diagnose, prescribe, or claim certainty. Return concise JSON with reply and summary fields.";

export async function POST(request: Request) {
  const { messages = [], language = "auto", mode = "chat" } = await request.json();
  const apiKey = process.env.ASHNA_API_KEY || process.env.LLM_API_KEY;
  const configuredBaseUrl = process.env.ASHNA_BASE_URL || process.env.LLM_BASE_URL || "https://api.openai.com/v1";
  const baseUrl = configuredBaseUrl.replace(/\/$/, "").replace(/\/api$/, "");
  if (!apiKey) {
    const last = messages.at(-1)?.content?.toLowerCase() ?? "";
    const reply = last.includes("pet") || last.includes("pain") || last.includes("dard")
      ? "Samajh gaya. Yeh problem kab se hai, aur dard 1 se 10 mein kitna hai? Kya nausea, vomiting, fever ya koi aur symptom bhi hai?"
      : "Main aapki baat note kar raha hoon. Main problem kya hai, kab se hai, aur severity kaisi hai?";
    return NextResponse.json({ reply, safety: "This assistant organizes information and does not diagnose or prescribe." });
  }
  const prompt = mode === "summary" ? "Summarize the patient's conversation in concise plain English text with these labels: Main problem, Symptoms, Duration, Severity, Other symptoms, Existing conditions, Current medicines, Allergies. Do not diagnose or prescribe. Mention unknown fields as Not captured." : `${systemPrompt} Language preference: ${language}. Return JSON with keys reply and summary.`;
  const response = await fetch(`${baseUrl}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: process.env.LLM_MODEL ?? "gpt-4o-mini", temperature: 0.2, messages: [{ role: "system", content: prompt }, ...messages] }) });
  if (!response.ok) return NextResponse.json({ error: "Assistant temporarily unavailable. Check the configured API URL and key." }, { status: 502 });
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  let result: { reply?: string; summary?: unknown };
  try { result = JSON.parse(content) as { reply?: string; summary?: unknown }; } catch { result = { reply: content, summary: {} }; }
  if (typeof result.reply === "string") {
    try {
      const nested = JSON.parse(result.reply) as { reply?: string; summary?: string };
      if (nested.reply || nested.summary) result = { ...result, reply: nested.reply || nested.summary };
    } catch { /* Provider returned normal text. */ }
  }
  if (!result.reply) result.reply = typeof result.summary === "string" ? result.summary : content;
  if (mode === "summary") {
    const context = await selectedPatient();
    if (context) {
      const db = await readDb();
      db.preConsultationSummaries.push({ id: id(), patientId: context.patient.id, summary: result.reply || content, conversation: messages.map((message: { content?: string }) => String(message.content || "")), createdAt: new Date().toISOString() });
      await writeDb(db);
    }
  }
  return NextResponse.json(result);
}
