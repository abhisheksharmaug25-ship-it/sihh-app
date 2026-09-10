import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { accountNumber, id, patientNumber, qrReference, readDb, writeDb } from "@/lib/store";

export async function GET() {
  const user = await currentUser();
  if (!user?.accountId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const db = await readDb();
  const account = db.accounts.find((item) => item.id === user.accountId);
  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  return NextResponse.json({ account, members: db.patients.filter((item) => item.accountId === account.id) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user?.accountId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json();
  if (!String(body.fullName ?? "").trim() || !String(body.relationship ?? "").trim()) return NextResponse.json({ error: "Full name and relationship are required." }, { status: 400 });
  const db = await readDb();
  const account = db.accounts.find((item) => item.id === user.accountId) ?? { id: user.accountId, accountNumber: accountNumber(), holderUserId: user.id, createdAt: new Date().toISOString() };
  if (!db.accounts.some((item) => item.id === account.id)) db.accounts.push(account);
  const now = new Date().toISOString();
  const member = { id: id(), patientId: patientNumber(), userId: user.id, accountId: account.id, relationship: String(body.relationship), qrReference: qrReference(), fullName: String(body.fullName), dateOfBirth: String(body.dateOfBirth ?? ""), gender: String(body.gender ?? ""), phone: String(body.phone ?? ""), createdAt: now, updatedAt: now };
  db.patients.push(member);
  await writeDb(db);
  return NextResponse.json(member, { status: 201 });
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user?.accountId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { patientId } = await request.json();
  const db = await readDb();
  const member = db.patients.find((item) => item.id === patientId && item.accountId === user.accountId);
  if (!member) return NextResponse.json({ error: "Family member not found." }, { status: 404 });
  const response = NextResponse.json({ patient: member });
  response.cookies.set("sihh_patient_context", member.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
