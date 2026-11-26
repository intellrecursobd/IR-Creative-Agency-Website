import { getDb } from "../../../db";
import { registrations } from "../../../db/schema";
import { count, eq, or } from "drizzle-orm";
import { findAvailableClanName } from "../../lib/clan-server";
import {
  normalizeClanName,
  normalizeEmail,
  normalizePhone,
} from "../../lib/clan-name";

export const dynamic = "force-dynamic";

const accessCodes = new Set([
  "SHADOW CAMP",
  "INNER CIRCLE",
  "NIGHT SIGNAL",
  "DUAL FREQUENCY",
]);
const TENT_CAPACITY = 7;

type RegistrationPayload = {
  originalName?: string;
  clanName?: string;
  phone?: string;
  email?: string;
  socialProfile?: string;
  accessCode?: string;
  partnerName?: string;
  tentAddon?: boolean;
  photoPreference?: "yes" | "no";
  website?: string;
};

function errorText(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  return `${message}\n${cause}`.toLowerCase();
}

function isSafeProfileUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return Response.json({ error: "Invalid request." }, { status: 415 });
    }

    const payload = (await request.json()) as RegistrationPayload;
    if (payload.website) {
      return Response.json({ success: true }, { status: 201 });
    }

    const originalName = payload.originalName?.trim().slice(0, 80) ?? "";
    const clanName = payload.clanName?.trim().slice(0, 80) ?? "";
    const phone = payload.phone?.trim().slice(0, 30) ?? "";
    const email = payload.email?.trim().slice(0, 120) ?? "";
    const socialProfile = payload.socialProfile?.trim().slice(0, 240) ?? "";
    const accessCode = payload.accessCode?.trim().toUpperCase() ?? "";
    const partnerName = payload.partnerName?.trim().slice(0, 80) || null;

    if (originalName.length < 2 || clanName.length < 3) {
      return Response.json({ error: "Original Name and Clan Name are required." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (normalizePhone(phone).length < 7) {
      return Response.json({ error: "Enter a valid phone number." }, { status: 400 });
    }
    if (!isSafeProfileUrl(socialProfile)) {
      return Response.json({ error: "Add a complete Instagram or social profile URL." }, { status: 400 });
    }
    if (!accessCodes.has(accessCode)) {
      return Response.json({ error: "Choose a valid Access Code." }, { status: 400 });
    }
    if (accessCode === "DUAL FREQUENCY" && !partnerName) {
      return Response.json({ error: "Add your partner's name for Dual Frequency." }, { status: 400 });
    }
    if (payload.photoPreference !== "yes" && payload.photoPreference !== "no") {
      return Response.json({ error: "Choose whether you would like us to take your photo." }, { status: 400 });
    }

    const db = await getDb();
    const tentRequested = accessCode === "SHADOW CAMP" || Boolean(payload.tentAddon);
    if (tentRequested) {
      const [inventory] = await db
        .select({ total: count() })
        .from(registrations)
        .where(
          or(
            eq(registrations.accessCode, "SHADOW CAMP"),
            eq(registrations.tentAddon, true),
          ),
        );

      if (Number(inventory?.total ?? 0) >= TENT_CAPACITY) {
        return Response.json(
          { error: "All 7 tents are reserved. Please choose a non-tent access option." },
          { status: 409 },
        );
      }
    }

    const [registration] = await db
      .insert(registrations)
      .values({
        originalName,
        clanName,
        clanKey: normalizeClanName(clanName),
        phone,
        phoneKey: normalizePhone(phone),
        email,
        emailKey: normalizeEmail(email),
        socialProfile,
        accessCode,
        partnerName,
        tentAddon: accessCode === "SHADOW CAMP" ? false : Boolean(payload.tentAddon),
        photoRequested: payload.photoPreference === "yes",
      })
      .returning({ id: registrations.id, clanName: registrations.clanName });

    return Response.json(
      { success: true, registration },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const detail = errorText(error);
    if (detail.includes("email_key") || detail.includes("phone_key")) {
      return Response.json(
        { error: "An application already exists for this email or phone number." },
        { status: 409 },
      );
    }
    if (detail.includes("clan_key")) {
      const suggestedClanName = await findAvailableClanName(1);
      return Response.json(
        { error: "That Clan Name was just taken. We generated another one.", suggestedClanName },
        { status: 409 },
      );
    }
    if (detail.includes("no such table")) {
      return Response.json({ error: "Registration is warming up. Please try again shortly." }, { status: 503 });
    }
    return Response.json({ error: "We couldn't submit your application. Please try again." }, { status: 500 });
  }
}
