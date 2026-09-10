import { cookies } from "next/headers";
import { readDb, type User } from "@/lib/store";

export async function currentUser(): Promise<User | null> {
  const session = (await cookies()).get("sihh_session")?.value;
  if (!session) return null;
  const db = await readDb();
  return db.users.find((user) => user.id === session) ?? null;
}
