"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

function getConfirmationState() {
  if (typeof window === "undefined") return "success";
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const error = params.get("error") || hash.get("error");
  return error ? "error" : "success";
}

export default function EmailConfirmedPage() {
  const state = useSyncExternalStore(() => () => {}, getConfirmationState, () => "success");
  const hasError = state === "error";

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  return (
    <main className="confirmation-page">
      <div className="confirmation-card">
        <Link className="confirmation-logo" href="/login" aria-label="Nexhire login"><span>✦</span> nexhire</Link>
        <div className={`confirmation-icon ${hasError ? "confirmation-icon-error" : ""}`} aria-hidden="true">
          {hasError ? "!" : "✓"}
        </div>
        <p className="confirmation-eyebrow">{hasError ? "Link unavailable" : "Email verified"}</p>
        <h1>{hasError ? "This link has expired" : "Your email is verified"}</h1>
        <p className="confirmation-copy">
          {hasError
            ? "This confirmation link is invalid or has expired. Create a new confirmation email and try again."
            : "Your Nexhire account is ready. You can now sign in and continue to your workspace."}
        </p>
        <Link className="confirmation-button" href={hasError ? "/check-email" : "/login"}>
          {hasError ? "Back to confirmation" : "Continue to login"}
          <span>→</span>
        </Link>
        <p className="confirmation-help">Need help? <a href="mailto:support@example.com">Contact support</a></p>
      </div>
      <p className="confirmation-footer">© 2026 Nexhire · Secure workspace access</p>
    </main>
  );
}
