import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDb } from "@/lib/store";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const db = await readDb();
  const user = db.users.find((item) => item.email === String(email ?? "").toLowerCase());
  if (!user || !(await bcrypt.compare(String(password ?? ""), user.passwordHash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  const response = NextResponse.json({ id: user.id, role: user.role });
  response.cookies.set("sihh_session", user.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
