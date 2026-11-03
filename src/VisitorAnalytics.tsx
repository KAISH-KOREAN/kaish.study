import { useEffect, useRef, useState } from "react";
import { ANALYTICS_URL, useVisitorAnalytics } from "./analytics";
import "./VisitorAnalytics.css";

export function VisitorAnalytics({
  screen,
  lessonKey,
}: {
  screen: string;
  lessonKey: string | null;
}) {
  const { choice, choose } = useVisitorAnalytics(screen, lessonKey);
  const dialog = useRef<HTMLDialogElement>(null);
  const [storageError, setStorageError] = useState(false);
  const blocked = Boolean(ANALYTICS_URL) && choice !== "yes";

  useEffect(() => {
    if (!blocked || !dialog.current) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [blocked]);

  function allow() {
    setStorageError(!choose("yes"));
  }

  function leave() {
    choose("no");
    window.location.replace("about:blank");
  }

  if (!ANALYTICS_URL) return null;

  if (blocked) {
    return (
      <dialog
        ref={dialog}
        className="kaish-analytics-dialog"
        data-analytics-ignore
        aria-modal="true"
        aria-labelledby="kaish-analytics-title"
        aria-describedby="kaish-analytics-description"
        onCancel={(event) => event.preventDefault()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <p className="kaish-analytics-eyebrow">KAISH · VISIT ANALYTICS</p>
        <h2 id="kaish-analytics-title">Before you enter KAISH</h2>
        <div id="kaish-analytics-description">
          <p>
            Access to KAISH requires allowing the usage analytics described below.
            If you prefer not to share this information, you can leave without
            enabling analytics.
          </p>
          <p>
            With your permission, we record your IP address, browser/device type,
            page views, button clicks, time on site and lesson activity for usage
            research. Records older than 30 days are removed from our analytics
            database daily.
          </p>
          <p>
            These analytics do not include your name, answers or activity on other
            websites. To reset your choice, clear KAISH site data in your browser.
          </p>
        </div>
        {storageError && (
          <p className="kaish-analytics-error" role="alert">
            Your browser could not save your choice. Enable site storage and try
            again, or leave without analytics.
          </p>
        )}
        <div className="kaish-analytics-actions">
          <button
            className="kaish-analytics-allow"
            type="button"
            autoFocus
            onClick={allow}
          >
            Allow analytics
          </button>
          <button
            className="kaish-analytics-leave"
            type="button"
            onClick={leave}
          >
            Leave without analytics
          </button>
        </div>
      </dialog>
    );
  }

  return null;
}
