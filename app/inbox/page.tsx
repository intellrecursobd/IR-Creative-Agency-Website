import { desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../db";
import { enquiries } from "../../db/schema";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";
const ADMIN_EMAIL = "pinkrahman@gmail.com";

export default async function InboxPage() {
  const user = await requireChatGPTUser("/inbox");
  if (user.email.toLowerCase() !== ADMIN_EMAIL) notFound();
  const db = await getDb();
  const entries = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(200);
  return <main className="admin-page"><div className="admin-shell"><header className="admin-header"><div><p className="eyebrow">INTELLRECURSO CREATIVE / PRIVATE STUDIO</p><h1>Project enquiries</h1><p>{entries.length ? `${entries.length} recent enquiry${entries.length === 1 ? "" : "s"}` : "Your next creative conversation starts here."}</p></div><div className="admin-links"><a href="/">View website</a><a href="/admin">Event archive</a><a href={chatGPTSignOutPath("/")}>Sign out</a></div></header>{!entries.length ? <div className="admin-empty"><h2>No project briefs yet.</h2><p>New enquiries submitted through your agency website will appear here.</p></div> : <div className="inbox-grid">{entries.map(entry => <article className="enquiry-card" key={entry.id}><div className="enquiry-top"><div><h2>{entry.name}{entry.brand ? ` / ${entry.brand}` : ""}</h2><p><a href={`mailto:${entry.email}`}>{entry.email}</a></p></div><div className="enquiry-date"><p>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(entry.createdAt.replace(" ", "T") + "Z"))} (Dhaka)</p><span>IR-{entry.requestKey.slice(0, 8).toUpperCase()}</span></div></div><div className="enquiry-services">{(JSON.parse(entry.services) as string[]).map(service => <span key={service}>{service}</span>)}</div><p className="enquiry-brief">{entry.brief}</p><div className="enquiry-details"><span>Budget: {entry.budget || "To discuss"}</span><span>Target launch: {entry.deadline || "To discuss"}</span><span>Status: {entry.status}</span></div></article>)}</div>}</div></main>;
}
