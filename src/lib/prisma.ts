type DatabaseClient = {
	hospital: { count: () => Promise<number>; findFirst: (args: unknown) => Promise<{ id: string } | null>; create: (args: unknown) => Promise<{ id: string }> };
	patient: { count: () => Promise<number>; findMany: (args: unknown) => Promise<unknown[]>; create: (args: unknown) => Promise<unknown> };
	doctor: { count: () => Promise<number> };
	user: { findUnique: (args: unknown) => Promise<unknown>; create: (args: unknown) => Promise<{ id: string; email: string; role: string }> };
	consultation: { create: (args: unknown) => Promise<unknown> };
};

export const prisma = {} as DatabaseClient;
