import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "./worker.mjs";
import { adminHtml } from "./admin.mjs";

test("a pending response cannot reopen the dashboard after sign out", async () => {
  const elements = new Map();
  const doc = { getElementById(id) {
    if (!elements.has(id)) elements.set(id, { hidden: id === "dashboard", value: id === "days" ? "30" : "", textContent: "", replaceChildren() {} });
    return elements.get(id);
  } };
  let resolveResponse;
  const fetchPending = () => new Promise(resolve => { resolveResponse = resolve; });
  const script = adminHtml.match(/<script>([\s\S]*)<\/script>/)[1];
  const api = new Function("document", "fetch", script + "; token = 'test-admin-token'; return { load };")(doc, fetchPending);
  const pending = api.load(false);
  doc.getElementById("logout").onclick();
  resolveResponse(Response.json({ events: [], lessons: [], totals: { sessions: 1 }, next: null }));
  await pending;
  assert.equal(doc.getElementById("dashboard").hidden, true);
  assert.equal(doc.getElementById("message").textContent, "Signed out.");
});

function setup() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  const env = {
    ADMIN_TOKEN: "test-password-that-is-at-least-32-characters",
    ALLOWED_ORIGINS: "https://kaish.study",
    COLLECT_LIMIT: { limit: async () => ({ success: true }) },
    ADMIN_LIMIT: { limit: async () => ({ success: true }) },
    DB: {
      prepare(sql) {
        let params = [];
        return {
          bind(...p) {
            params = p;
            return this;
          },
          async run() {
            return db.prepare(sql).run(...params);
          },
          async first() {
            return db.prepare(sql).get(...params);
          },
          async all() {
            return { results: db.prepare(sql).all(...params) };
          },
        };
      },
    },
  };
  const event = (values = {}) => ({
    eventId: crypto.randomUUID(),
    session: crypto.randomUUID(),
    event: "page_view",
    path: "/",
    ...values,
  });
  const collect = (body, origin = "https://kaish.study") =>
    worker.fetch(
      new Request("https://analytics.example/collect", {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          "CF-Connecting-IP": "203.0.113.42",
          "User-Agent": "Test browser",
        },
        body: JSON.stringify(body),
      }),
      env,
    );
  const admin = (query = "", password = env.ADMIN_TOKEN) =>
    worker.fetch(
      new Request("https://analytics.example/admin/data" + query, {
        headers: { Authorization: "Bearer " + password },
      }),
      env,
    );
  return { db, env, event, collect, admin };
}

test("rejects foreign origins and anonymous admin access", async () => {
  const { collect, event, admin, db } = setup();
  assert.equal((await collect(event(), "https://evil.example")).status, 403);
  assert.equal((await admin("", "wrong")).status, 401);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM events").get().n, 0);
});

test("uses edge IP, strips query strings, stores SQL text safely and deduplicates event IDs", async () => {
  const { collect, event, db } = setup();
  const payload = event({
    path: "/study?private=secret",
    screen: "'); DROP TABLE events; --",
    ip: "spoofed",
  });
  assert.equal((await collect(payload)).status, 204);
  assert.equal((await collect(payload)).status, 204);
  const rows = db.prepare("SELECT * FROM events").all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].ip, "203.0.113.42");
  assert.equal(rows[0].path, "/study");
  assert.equal(rows[0].screen, payload.screen);
});

test("rejects invalid IDs, missing attempts, oversized bodies and durations", async () => {
  const { collect, event } = setup();
  for (const body of [
    event({ session: "invalid" }),
    event({ event: "lesson_start" }),
    event({ event: "active_time", seconds: -1 }),
    event({ event: "active_time", seconds: 301 }),
    event({ screen: "x".repeat(5000) }),
  ]) {
    assert.equal((await collect(body)).status, 400);
  }
});

test("lesson funnel distinguishes completed, left, inactive and ongoing attempts", async () => {
  const { collect, event, admin, db } = setup();
  for (const state of ["complete", "left", "inactive", "ongoing"]) {
    const attempt = crypto.randomUUID();
    const session = crypto.randomUUID();
    await collect(
      event({ event: "lesson_start", attempt, session, lesson: "Lesson 1" }),
    );
    if (state === "complete")
      await collect(
        event({
          event: "lesson_complete",
          attempt,
          session,
          lesson: "Lesson 1",
        }),
      );
    if (state === "left")
      await collect(
        event({ event: "lesson_leave", attempt, session, lesson: "Lesson 1" }),
      );
    if (state === "inactive")
      db.prepare("UPDATE events SET received_at=? WHERE attempt_id=?").run(
        Date.now() - 31 * 60000,
        attempt,
      );
  }
  const result = await (await admin()).json();
  assert.equal(result.lessons[0].started, 4);
  assert.equal(result.lessons[0].completed, 1);
  assert.equal(result.lessons[0].abandoned, 2);
  assert.equal(result.totals.sessions, 4);
});

test("enforces rate limit and scheduled retention without deleting recent data", async () => {
  const { collect, event, env, db } = setup();
  await collect(event());
  await collect(event());
  db.prepare("UPDATE events SET received_at=? WHERE id=1").run(
    Date.now() - 31 * 86400000,
  );
  await worker.scheduled({}, env);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM events").get().n, 1);
  env.COLLECT_LIMIT.limit = async () => ({ success: false });
  assert.equal((await collect(event())).status, 429);
});

test("admin script parses and renders untrusted text using textContent", () => {
  const script = adminHtml.match(/<script>([\s\S]*)<\/script>/)[1];
  assert.doesNotThrow(() => new Function(script));
  assert.equal(script.includes("innerHTML"), false);
  const detect = new Function(
    "return (" + script.match(/function device\(ua\) {[\s\S]*?\n}/)[0] + ")",
  )();
  assert.equal(
    detect("Windows Chrome/130.0 Edg/130.0"),
    "Desktop / unknown · Windows · Edge",
  );
  assert.equal(
    detect("Android Mobile Chrome/130.0"),
    "Mobile · Android · Chrome",
  );
});
