import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type UserRole = "PATIENT" | "DOCTOR";
export type DocumentCategory = "PRESCRIPTION" | "LAB_REPORT" | "MEDICAL_REPORT" | "OTHER";
export type User = { id: string; email: string; passwordHash: string; role: UserRole; accountId?: string; patientId?: string; doctorId?: string };
export type Patient = { id: string; patientId: string; userId: string; accountId?: string; relationship?: string; qrReference?: string; fullName: string; dateOfBirth?: string; gender?: string; phone?: string; bloodGroup?: string; allergies?: string; emergencyContact?: string; address?: string; city?: string; state?: string; pincode?: string; currentMedicines?: string; majorConditions?: string; createdAt: string; updatedAt: string };
export type History = { id: string; patientId: string; type: string; title: string; description?: string; eventDate?: string; attachment?: { storedName: string; fileName: string; mimeType: string; size: number }; createdAt: string };
export type StoredDocument = { id: string; patientId: string; category: DocumentCategory; fileName: string; storedName: string; mimeType: string; size: number; createdAt: string };
export type HealthReading = { id: string; patientId: string; kind: "sugar" | "bp" | "weight" | "pulse" | "temperature"; date: string; time: string; value?: number; systolic?: number; diastolic?: number; mealContext?: string; unit?: string; createdAt: string };
export type Medicine = { id: string; patientId: string; name: string; dosage: string; frequency: string; startDate: string; endDate?: string; instructions?: string; createdAt: string; updatedAt: string };
export type PreConsultationSummary = { id: string; patientId: string; summary: string; conversation: string[]; createdAt: string };
export type Account = { id: string; accountNumber: string; holderUserId: string; createdAt: string };
export type Database = { accounts: Account[]; users: User[]; patients: Patient[]; histories: History[]; documents: StoredDocument[]; readings: HealthReading[]; medicines: Medicine[]; preConsultationSummaries: PreConsultationSummary[] };

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "sihh.json");
export const uploadDir = path.join(process.cwd(), "public", "uploads");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(uploadDir, { recursive: true });
  try { await fs.access(dataFile); } catch { await fs.writeFile(dataFile, JSON.stringify({ accounts: [], users: [], patients: [], histories: [], documents: [], readings: [], medicines: [], preConsultationSummaries: [] }, null, 2)); }
}
export async function readDb(): Promise<Database> { await ensureStore(); const db = JSON.parse(await fs.readFile(dataFile, "utf8")) as Partial<Database>; return { accounts: db.accounts ?? [], users: db.users ?? [], patients: db.patients ?? [], histories: db.histories ?? [], documents: db.documents ?? [], readings: db.readings ?? [], medicines: db.medicines ?? [], preConsultationSummaries: db.preConsultationSummaries ?? [] }; }
export async function writeDb(db: Database) { await ensureStore(); await fs.writeFile(dataFile, JSON.stringify(db, null, 2)); }
export function id() { return crypto.randomUUID(); }
export function patientNumber() { return `SIH-${Math.floor(100000 + Math.random() * 900000)}`; }
export function accountNumber() { return `ACC-${Math.floor(100000 + Math.random() * 900000)}`; }
export function qrReference() { return `QR-${crypto.randomUUID()}`; }
export function publicPatient(patient: Patient) { return { ...patient }; }
