import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { accountNumber, id, patientNumber, qrReference, readDb, writeDb, type User } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, role = "PATIENT" } = body;
    if (!email || !password || !fullName || password.length < 8) {
      return NextResponse.json({ error: "Name, email, and a password of at least 8 characters are required." }, { status: 400 });
    }
    const db = await readDb();
    const existing = db.users.find((user) => user.email === email.toLowerCase());
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = id();
    const accountId = id();
    const user: User = { id: userId, email: email.toLowerCase(), passwordHash, role: role as "PATIENT" | "DOCTOR", accountId };
    db.users.push(user);
    if (role === "PATIENT") {
      const now = new Date().toISOString();
      db.accounts.push({ id: accountId, accountNumber: accountNumber(), holderUserId: userId, createdAt: now });
      const patient = { id: id(), patientId: patientNumber(), userId, accountId, relationship: "Self", qrReference: qrReference(), fullName, phone: String(body.phone ?? ""), createdAt: now, updatedAt: now };
      db.patients.push(patient);
      user.patientId = patient.id;
    }
    await writeDb(db);
    const response = NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
    response.cookies.set("sihh_session", user.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
