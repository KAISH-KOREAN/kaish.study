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
        <p className="kaish-analytics-eyebrow">KAISH</p>
        <h2 id="kaish-analytics-title">Before you enter KAISH</h2>
        <div id="kaish-analytics-description">
          <p>
            Welcome to Kaish! Our study and review materials are completely free to use. We hope you’ll keep supporting Kaish as we continue to grow
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
            I Understand
          </button>
          <button
            className="kaish-analytics-leave"
            type="button"
            onClick={leave}
          >
            Leave the Site
          </button>
        </div>
      </dialog>
    );
  }

  return null;
}
