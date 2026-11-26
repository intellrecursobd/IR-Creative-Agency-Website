import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { registrations } from "../../db/schema";
import { createRandomClanName, normalizeClanName } from "./clan-name";

export async function findAvailableClanName(variant = 0) {
  const db = await getDb();
  for (let suffix = 0; suffix < 100; suffix += 1) {
    const candidate = createRandomClanName(variant + suffix);
    const key = normalizeClanName(candidate);
    const existing = await db
      .select({ id: registrations.id })
      .from(registrations)
      .where(eq(registrations.clanKey, key))
      .limit(1);

    if (existing.length === 0) return candidate;
  }

  return `${createRandomClanName(variant)} ${Date.now().toString().slice(-3)}`;
}
