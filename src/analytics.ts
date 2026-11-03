import { useEffect, useState } from "react";

// Set this to your deployed Cloudflare Worker URL, without a trailing slash.
export const ANALYTICS_URL = "https://kaish-analytics.kaish-study-research.workers.dev";
const CHOICE_KEY = "kaish-analytics-choice-v1";
const SESSION_KEY = "kaish-analytics-session-v1";
let attempt: { id: string; lesson: string; completed: boolean } | null = null;

function allowed() {
  try {
    return !!ANALYTICS_URL && localStorage.getItem(CHOICE_KEY) === "yes";
  } catch {
    return false;
  }
}

function track(event: string, details: Record<string, string | number> = {}) {
  if (!allowed()) return;
  try {
    let session = sessionStorage.getItem(SESSION_KEY);
    if (!session) {
      session = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, session);
    }
    const payload = {
      eventId: crypto.randomUUID(),
      session,
      event,
      path: location.pathname + (location.hash === "#about" ? "#about" : ""),
      ...details,
    };
    void fetch(`${ANALYTICS_URL}/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "omit",
    }).catch(() => {});
  } catch {
    // Analytics must never prevent a student from using a lesson.
  }
}

export function completeAnalyticsLesson() {
  if (!attempt || attempt.completed || !allowed()) return;
  attempt.completed = true;
  track("lesson_complete", { attempt: attempt.id, lesson: attempt.lesson });
}

export function useVisitorAnalytics(screen: string, lessonKey: string | null) {
  const [choice, setChoice] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CHOICE_KEY);
    } catch {
      return null;
    }
  });

  function choose(value: "yes" | "no") {
    try {
      localStorage.setItem(CHOICE_KEY, value);
      if (value === "no") sessionStorage.removeItem(SESSION_KEY);
    } catch {
      return;
    }
    setChoice(value);
  }

  useEffect(() => {
    const sync = () => {
      try {
        setChoice(localStorage.getItem(CHOICE_KEY));
      } catch {
        setChoice("no");
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (choice !== "yes") return;
    // Deferring the first event avoids duplicate mounts in React Strict Mode.
    const initial = window.setTimeout(() => track("page_view"), 0);
    const onHash = () => track("page_view");
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("button, a");
      if (!target || target.closest("[data-analytics-ignore]")) return;
      const elements = Array.from(document.querySelectorAll("button, a"));
      // Use explicit labels or a DOM position, never form values or visible names.
      track("click", {
        label:
          target.dataset.analytics ||
          `${target.tagName.toLowerCase()}-${elements.indexOf(target) + 1}`,
      });
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick, true);
    return () => {
      clearTimeout(initial);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick, true);
    };
  }, [choice]);

  useEffect(() => {
    if (choice !== "yes") return;
    const timer = window.setTimeout(
      () => track("screen_view", { screen: screen.slice(0, 240) }),
      0,
    );
    return () => clearTimeout(timer);
  }, [choice, screen]);

  useEffect(() => {
    if (choice !== "yes" || !lessonKey) return;
    let started: typeof attempt = null;
    const timer = window.setTimeout(() => {
      started = {
        id: crypto.randomUUID(),
        lesson: lessonKey.slice(0, 240),
        completed: false,
      };
      attempt = started;
      track("lesson_start", { attempt: started.id, lesson: started.lesson });
    }, 0);
    return () => {
      clearTimeout(timer);
      if (started && !started.completed)
        track("lesson_leave", { attempt: started.id, lesson: started.lesson });
      if (attempt === started) attempt = null;
    };
  }, [choice, lessonKey]);

  useEffect(() => {
    if (choice !== "yes") return;
    let last = performance.now();
    let visible = document.visibilityState === "visible";
    let remainder = 0;
    const flush = () => {
      const now = performance.now();
      if (visible) remainder += Math.max(0, now - last);
      last = now;
      const seconds = Math.floor(remainder / 1000);
      remainder -= seconds * 1000;
      if (seconds)
        track("active_time", {
          seconds: Math.min(seconds, 300),
          ...(attempt ? { attempt: attempt.id, lesson: attempt.lesson } : {}),
        });
    };
    const visibility = () => {
      flush();
      visible = document.visibilityState === "visible";
    };
    const timer = window.setInterval(flush, 15000);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [choice]);

  return { choice, choose };
}
