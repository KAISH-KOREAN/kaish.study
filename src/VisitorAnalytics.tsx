import { ANALYTICS_URL, useVisitorAnalytics } from "./analytics";

export function VisitorAnalytics({
  screen,
  lessonKey,
}: {
  screen: string;
  lessonKey: string | null;
}) {
  const { choice, choose } = useVisitorAnalytics(screen, lessonKey);

  if (!ANALYTICS_URL) return null;
  return (
    <aside
      data-analytics-ignore
      aria-label="Visit analytics settings"
      style={{
        position: "fixed",
        left: 12,
        bottom: 12,
        zIndex: 2000,
        maxWidth: "min(410px, calc(100vw - 24px))",
        padding: 14,
        border: "1px solid #686b70",
        borderRadius: 12,
        background: "#151a20",
        color: "#fff",
        fontSize: 13,
        lineHeight: 1.5,
        boxShadow: "0 5px 25px #0006",
      }}
    >
      {choice === null ? (
        <>
          <strong>Help us understand how KAISH is used</strong>
          <p style={{ margin: "6px 0 10px" }}>
            With your permission, we record your IP address, browser/device
            type, page views, button clicks and lesson activity for usage
            research. Records older than 30 days are removed from our analytics
            database daily. These analytics do not include your name, answers or activity
            on other websites.
          </p>
          <button
            type="button"
            onClick={() => choose("yes")}
            style={{
              padding: "7px 12px",
              marginRight: 8,
              borderRadius: 6,
              background: "#fff",
              color: "#111",
            }}
          >
            Allow analytics
          </button>
          <button
            type="button"
            onClick={() => choose("no")}
            style={{
              padding: "7px 12px",
              borderRadius: 6,
              border: "1px solid #aaa",
            }}
          >
            Decline
          </button>
        </>
      ) : (
        <>
          Analytics {choice === "yes" ? "on" : "off"}.{" "}
          <button
            type="button"
            onClick={() => choose(choice === "yes" ? "no" : "yes")}
            style={{ textDecoration: "underline" }}
          >
            {choice === "yes" ? "Stop tracking" : "Allow analytics"}
          </button>
        </>
      )}
    </aside>
  );
}
