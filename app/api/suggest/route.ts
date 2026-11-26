import { findAvailableClanName } from "../../lib/clan-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = (url.searchParams.get("name") ?? "").trim().slice(0, 80);
  const variant = Math.max(0, Math.min(20, Number(url.searchParams.get("variant") ?? 0) || 0));

  if (name.length < 2) {
    return Response.json({ error: "Enter at least 2 characters." }, { status: 400 });
  }

  try {
    const clanName = await findAvailableClanName(variant);
    return Response.json(
      { clanName },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Clan Name suggestion is temporarily unavailable." },
      { status: 503 },
    );
  }
}
