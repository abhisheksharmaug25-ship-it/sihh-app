import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  if (!query) return NextResponse.json([]);
  const patients = await prisma.patient.findMany({ where: { OR: [{ patientId: { contains: query } }, { fullName: { contains: query } }, { phone: { contains: query } }] }, select: { id: true, patientId: true, fullName: true, dateOfBirth: true, gender: true, bloodGroup: true, allergies: true, currentMedicines: true, majorConditions: true } });
  return NextResponse.json(patients);
}
