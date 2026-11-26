import { desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../db";
import { registrations } from "../../db/schema";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "pinkrahman@gmail.com";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (user.email.toLowerCase() !== ADMIN_EMAIL) notFound();

  const db = await getDb();
  const entries = await db
    .select()
    .from(registrations)
    .orderBy(desc(registrations.createdAt));

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="section-label">IntellRecurso Creative // event archive</p>
            <h1>Archived event applications</h1>
            <p>{entries.length} submission{entries.length === 1 ? "" : "s"} received</p>
          </div>
          <a href={chatGPTSignOutPath("/")}>Sign out</a>
        </header>

        {entries.length === 0 ? (
          <div className="admin-empty">No transmissions received yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Guest</th>
                  <th>Clan Name</th>
                  <th>Contact</th>
                  <th>Profile</th>
                  <th>Access</th>
                  <th>Partner / Tent</th>
                  <th>Photo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.createdAt}</td>
                    <td>{entry.originalName}</td>
                    <td><strong>{entry.clanName}</strong></td>
                    <td>
                      <a href={`mailto:${entry.email}`}>{entry.email}</a>
                      <span>{entry.phone}</span>
                    </td>
                    <td>
                      <a href={entry.socialProfile} target="_blank" rel="noreferrer">
                        Open profile
                      </a>
                    </td>
                    <td>{entry.accessCode}</td>
                    <td>
                      {entry.partnerName && <span>{entry.partnerName}</span>}
                      <span>{entry.tentAddon ? "Tent add-on" : "No add-on"}</span>
                    </td>
                    <td>{entry.photoRequested ? "Yes" : "No"}</td>
                    <td><span className="status-pill">{entry.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
