import { and, count, eq, gte } from "drizzle-orm";
import { getDb } from "../../../db";
import { enquiries } from "../../../db/schema";
import { serviceNames } from "../../lib/agency";

export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
const value = (input: unknown, max: number) => typeof input === "string" ? input.trim().slice(0, max) : "";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Please submit the project form." }, 415);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Please submit your brief from our website." }, 403);
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).length > 12000) return json({ error: "Please keep your brief under 4,000 characters." }, 413);
    let payload: Record<string, unknown>;
    try { payload = JSON.parse(body); } catch { return json({ error: "Please check your form and try again." }, 400); }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return json({ error: "Invalid project brief." }, 400);
    if (payload.website) return json({ success: true }, 201);
    const name = value(payload.name, 100);
    const email = value(payload.email, 200).toLowerCase();
    const brand = value(payload.brand, 160);
    const budget = value(payload.budget, 100);
    const deadline = value(payload.deadline, 10);
    const brief = value(payload.brief, 4000);
    const requestKey = value(payload.requestId, 36);
    const selected = Array.isArray(payload.services) ? [...new Set(payload.services)].filter((item): item is string => typeof item === "string") : [];
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || brief.length < 20 || payload.consent !== true || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestKey)) return json({ error: "Add your name, a valid email, a brief of at least 20 characters, and your consent." }, 400);
    if (!selected.length || selected.length > serviceNames.length || selected.some(service => !(serviceNames as readonly string[]).includes(service))) return json({ error: "Choose at least one of our services." }, 400);
    if (deadline && (!/^\d{4}-\d{2}-\d{2}$/.test(deadline) || !Number.isFinite(Date.parse(deadline)) || new Date(deadline).toISOString().slice(0, 10) !== deadline)) return json({ error: "Please enter a valid launch date." }, 400);
    const db = await getDb();
    const reference = `IR-${requestKey.slice(0, 8).toUpperCase()}`;
    const [existing] = await db.select({ id: enquiries.id }).from(enquiries).where(eq(enquiries.requestKey, requestKey)).limit(1);
    if (existing) return json({ success: true, reference });
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
    const [recent] = await db.select({ total: count() }).from(enquiries).where(and(eq(enquiries.email, email), gte(enquiries.createdAt, since)));
    if (Number(recent?.total || 0) >= 5) return json({ error: "We’ve received your recent briefs. Please try again in an hour." }, 429);
    await db.insert(enquiries).values({ requestKey, name, email, brand, services: JSON.stringify(selected), budget, deadline, brief }).onConflictDoNothing({ target: enquiries.requestKey });
    return json({ success: true, reference }, 201);
  } catch { return json({ error: "Your brief couldn’t be saved. Please try again in a moment." }, 503); }
}
