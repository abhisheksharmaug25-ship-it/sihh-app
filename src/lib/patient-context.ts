import { cookies } from "next/headers";
import { currentUser } from "@/lib/auth";
import { readDb, type Patient, type User } from "@/lib/store";

export async function selectedPatient(): Promise<{ user: User; patient: Patient } | null> {
  const user = await currentUser();
  if (!user?.accountId) return null;
  const db = await readDb();
  const contextId = (await cookies()).get("sihh_patient_context")?.value;
  const patient = db.patients.find((item) => item.id === contextId && item.accountId === user.accountId) ?? db.patients.find((item) => item.id === user.patientId && item.accountId === user.accountId);
  return patient ? { user, patient } : null;
}
