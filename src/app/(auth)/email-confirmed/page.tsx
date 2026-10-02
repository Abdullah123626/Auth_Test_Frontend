"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { announceEmailVerified } from "@/src/lib/auth/verification-channel";

type ConfirmationState = "verified" | "error";

// Hash (token/error) URL se hata dete hain, is liye pehli baar ka natija yaad rakhte hain.
// href ke saath rakhte hain taake isi tab me naya link khule to dobara padha jaye.
let cached: { href: string; state: ConfirmationState; announced: boolean } | null = null;

function readConfirmationState(): ConfirmationState {
  if (cached && cached.href === window.location.href) return cached.state;
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const state = params.get("error") || hash.get("error") ? "error" : "verified";
  // Sirf asli confirmation link (token ke saath) par hi doosre tab ko khabar dete hain.
  cached = { href: window.location.href, state, announced: !hash.get("access_token") };
  return state;
}

export default function EmailConfirmedPage() {
  const state = useSyncExternalStore(() => () => {}, readConfirmationState, () => null);
  const hasError = state === "error";

  useEffect(() => {
    readConfirmationState();
    if (!cached) return;
    // Purane tab ko batao taake wahan login screen khul jaye.
    if (cached.state === "verified" && !cached.announced) {
      cached.announced = true;
      announceEmailVerified();
    }
    // Confirmation link ka token URL me nahi rehna chahiye.
    if (window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      cached.href = window.location.href;
    }
  }, []);

  if (!state) return <main className="auth-loading-screen">Confirming your email...</main>;

  return (
    <main className="confirmation-page">
      <div className="confirmation-card">
        <span className="confirmation-logo" aria-label="Nexhire"><span>✦</span> nexhire</span>
        <div className={`confirmation-icon ${hasError ? "confirmation-icon-error" : ""}`} aria-hidden="true">
          {hasError ? "!" : "✓"}
        </div>
        <p className="confirmation-eyebrow">{hasError ? "Link unavailable" : "Email verified"}</p>
        <h1>{hasError ? "This link has expired" : "Your email is verified"}</h1>
        <p className="confirmation-copy">
          {hasError
            ? "This confirmation link is invalid or has expired. Go back to the original tab and request a new confirmation email."
            : "You can close this tab now. Go back to the tab where you signed up — the login screen is already open there."}
        </p>
        {hasError ? (
          <Link className="confirmation-button" href="/check-email">Back to confirmation <span>→</span></Link>
        ) : (
          <p className="confirmation-help">Opened this link on another device? <Link href="/login?verified=1">Log in here</Link></p>
        )}
      </div>
      <p className="confirmation-footer">© 2026 Nexhire · Secure workspace access</p>
    </main>
  );
}
