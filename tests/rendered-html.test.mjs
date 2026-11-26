import assert from "node:assert/strict";
import test from "node:test";

test("renders production site metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>IntellRecurso Creative — Ideas with attitude\.<\/title>/i);
  assert.match(html, /id="services"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /STUDIO CONCEPT/);
  assert.doesNotMatch(html, /Choose your|Enter the registry|Access menu|eclipse-ticket-bg/);
  assert.doesNotMatch(html, /name=["']codex-preview["']/i);
});

test("rejects invalid or cross-origin enquiries before storing data", async () => {
  const { default: worker } = await import(new URL("../dist/server/index.js", import.meta.url));
  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  const valid = { requestId: "12345678-1234-4234-8234-123456789012", name: "Test brand", email: "qa@example.com", brief: "We would like a fresh visual identity for our brand.", services: ["Brand strategy & identity"], consent: true };
  const cases = [
    { body: JSON.stringify({ ...valid, email: "invalid" }), status: 400 },
    { body: JSON.stringify({ ...valid, services: [] }), status: 400 },
    { body: JSON.stringify({ ...valid, consent: false }), status: 400 },
    { body: JSON.stringify({ ...valid, deadline: "2026-02-31" }), status: 400 },
    { body: "not json", status: 400 },
    { body: "x".repeat(12001), status: 413 },
    { body: JSON.stringify(valid), status: 403, origin: "https://unrelated.example" },
  ];
  for (const item of cases) {
    const response = await worker.fetch(new Request("http://localhost/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json", ...(item.origin ? { Origin: item.origin } : {}) }, body: item.body }), env, ctx);
    assert.equal(response.status, item.status);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

test("protects the agency inbox from anonymous visitors", async () => {
  const { default: worker } = await import(new URL("../dist/server/index.js", import.meta.url));
  const response = await worker.fetch(new Request("http://localhost/inbox"), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.ok([302, 303, 307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /\/signin-with-chatgpt\?return_to=%2Finbox/);
});
