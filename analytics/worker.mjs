import { adminHtml } from "./admin.mjs";

const DAY = 86400000;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENTS = new Set([
  "page_view",
  "screen_view",
  "click",
  "active_time",
  "lesson_start",
  "lesson_complete",
  "lesson_leave",
]);
const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};
const json = (value, status = 200, extra = {}) =>
  Response.json(value, { status, headers: { ...headers, ...extra } });
const text = (value, limit) =>
  typeof value === "string" ? value.slice(0, limit) : "";

async function authorized(request, secret) {
  if (typeof secret !== "string" || secret.length < 32) return false;
  const token =
    request.headers.get("Authorization")?.replace(/^Bearer /, "") || "";
  if (token.length > 256) return false;
  const digest = async (s) =>
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    );
  const [a, b] = await Promise.all([digest(token), digest(secret)]);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}

async function smallJson(request) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    throw new Error("type");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty");
  let length = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        throw new Error("size");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(data));
}

async function handle(request, env) {
  const url = new URL(request.url);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  if (url.pathname === "/admin" && request.method === "GET") {
    return new Response(adminHtml, {
      headers: {
        ...headers,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy":
          "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
      },
    });
  }

  if (url.pathname === "/admin/data" && request.method === "GET") {
    if (!(await env.ADMIN_LIMIT.limit({ key: `admin:${ip}` })).success)
      return json({ error: "Too many requests. Try again in a minute." }, 429);
    if (!(await authorized(request, env.ADMIN_TOKEN)))
      return json({ error: "Invalid admin password." }, 401);
    const since =
      Date.now() - (url.searchParams.get("days") === "7" ? 7 : 30) * DAY;
    const before = Number(
      url.searchParams.get("before") || Number.MAX_SAFE_INTEGER,
    );
    const session = url.searchParams.get("session") || "";
    if (
      !Number.isSafeInteger(before) ||
      before < 1 ||
      (session && !UUID.test(session))
    )
      return json({ error: "Invalid filter." }, 400);
    const rows = await env.DB.prepare(
      `SELECT * FROM events WHERE received_at >= ? AND id < ? AND (? = '' OR session_id = ?) ORDER BY id DESC LIMIT 100`,
    )
      .bind(since, before, session, session)
      .all();
    const totals = await env.DB.prepare(
      `SELECT COUNT(DISTINCT session_id) AS sessions, SUM(event = 'page_view') AS views, COALESCE(SUM(seconds), 0) AS visible_seconds FROM events WHERE received_at >= ?`,
    )
      .bind(since)
      .first();
    const lessons = await env.DB.prepare(
      `
      SELECT lesson, COUNT(*) AS started, SUM(completed) AS completed,
        SUM(CASE WHEN completed = 0 AND (left_lesson = 1 OR last_seen < ?) THEN 1 ELSE 0 END) AS abandoned
      FROM (
        SELECT attempt_id, MAX(lesson) AS lesson, MAX(event = 'lesson_start') AS started,
          MAX(event = 'lesson_complete') AS completed, MAX(event = 'lesson_leave') AS left_lesson,
          MAX(received_at) AS last_seen
        FROM events WHERE received_at >= ? AND attempt_id != '' GROUP BY attempt_id
      ) WHERE started = 1 GROUP BY lesson ORDER BY started DESC LIMIT 100
    `,
    )
      .bind(Date.now() - 30 * 60000, since)
      .all();
    return json({
      events: rows.results,
      totals,
      lessons: lessons.results,
      next: rows.results.length === 100 ? rows.results[99].id : null,
    });
  }

  if (url.pathname !== "/collect") return json({ error: "Not found." }, 404);
  const origin = request.headers.get("Origin") || "";
  const origins = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim());
  if (!origin || !origins.includes(origin))
    return json({ error: "Origin not allowed." }, 403);
  const cors = { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
  if (request.method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        ...cors,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405, cors);
  if (!(await env.COLLECT_LIMIT.limit({ key: `collect:${ip}` })).success)
    return json({ error: "Rate limit." }, 429, cors);

  let body;
  try {
    body = await smallJson(request);
  } catch {
    return json({ error: "Expected JSON, at most 4096 bytes." }, 400, cors);
  }
  if (
    !body ||
    typeof body.eventId !== "string" ||
    typeof body.session !== "string" ||
    !UUID.test(body.eventId) ||
    !UUID.test(body.session) ||
    !EVENTS.has(body.event)
  )
    return json({ error: "Invalid event." }, 400, cors);
  const attempt = body.attempt === undefined ? "" : body.attempt;
  const lesson = text(body.lesson, 240);
  if (
    typeof attempt !== "string" ||
    (attempt && !UUID.test(attempt)) ||
    (body.event.startsWith("lesson_") && (!attempt || !lesson))
  )
    return json({ error: "Invalid lesson attempt." }, 400, cors);
  const seconds = body.event === "active_time" ? body.seconds : 0;
  if (!Number.isInteger(seconds) || seconds < 0 || seconds > 300)
    return json({ error: "Invalid duration." }, 400, cors);
  const path = text(body.path, 240).split("?")[0];
  if (!path.startsWith("/") || path.startsWith("//"))
    return json({ error: "Invalid path." }, 400, cors);
  await env.DB.prepare(
    `INSERT OR IGNORE INTO events
    (event_id, received_at, session_id, event, path, screen, lesson, attempt_id, label, seconds, ip, country, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      body.eventId,
      Date.now(),
      body.session,
      body.event,
      path,
      text(body.screen, 240),
      lesson,
      attempt,
      text(body.label, 120),
      seconds,
      ip,
      text(request.cf?.country, 2),
      text(request.headers.get("User-Agent"), 512),
    )
    .run();
  return new Response(null, { status: 204, headers: { ...headers, ...cors } });
}

export default {
  async fetch(request, env) {
    try {
      return await handle(request, env);
    } catch {
      return json(
        { error: "Analytics unavailable. Please try again later." },
        503,
      );
    }
  },
  async scheduled(_event, env) {
    await env.DB.prepare("DELETE FROM events WHERE received_at < ?")
      .bind(Date.now() - 30 * DAY)
      .run();
  },
};
