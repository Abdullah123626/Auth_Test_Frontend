"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { api, clearPendingEmail, getApiErrorMessage, getPendingEmail } from "@/src/lib/api";
import { onEmailVerified } from "@/src/lib/auth/verification-channel";

export default function CheckEmailPage() {
  const router = useRouter();

  // Gmail wale tab me email verify hote hi ye tab khud login screen par chala jata hai.
  // Pending email login form me pehle se bharne ke liye rehne dete hain.
  useEffect(() => onEmailVerified(() => router.replace("/login?verified=1")), [router]);

  const email = useSyncExternalStore(
    () => () => {},
    getPendingEmail,
    () => "",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);

  async function handleResend() {
    if (!email) {
      setError("Enter your email on the signup screen first.");
      return;
    }

    setError("");
    setMessage("");
    setIsResending(true);
    try {
      const response = await api.resendConfirmation(email);
      setMessage(response.message || "If an unverified account exists for this email, a confirmation email has been sent.");
    } catch (resendError) {
      setError(getApiErrorMessage(resendError, "Unable to resend the confirmation email."));
    } finally {
      setIsResending(false);
    }
  }

  function handleBackToLogin() {
    clearPendingEmail();
  }

  return (
    <section className="reference-auth-shell">
      <div className="reference-form-panel">
        <div className="reference-form-content check-email-content">
          <Link className="reference-logo" href="/" aria-label="Nexhire home"><span>✦</span></Link>
          <div className="email-symbol">@</div>
          <h1>Check your email</h1>
          <p className="reference-subtitle">
            We sent a confirmation link to<br />
            <strong>{email || "your email address"}</strong>.
          </p>
          <p className="check-email-copy">Open the link in that email to verify your account. After verification, return here and log in.</p>
          <div className="check-email-actions">
            <button className="reference-submit" type="button" onClick={handleResend} disabled={isResending}>
              {isResending ? "Sending..." : "Resend confirmation email"}
            </button>
            {message && <p className="reference-success" role="status">{message}</p>}
            {error && <p className="reference-error" role="alert">{error}</p>}
          </div>
          <p className="reference-switch check-email-back">Already verified? <Link href="/login" onClick={handleBackToLogin}>Log in</Link></p>
        </div>
        <p className="reference-legal"><a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></p>
      </div>

      <aside className="reference-green-panel" aria-label="Nexhire product preview">
        <div className="green-panel-header"><span>nexhire.com/verify</span><span>✦</span></div>
        <div className="dashboard-preview" aria-hidden="true">
          <div className="preview-back preview-back-one" /><div className="preview-back preview-back-two" />
          <div className="preview-window">
            <div className="preview-window-top"><b>✦</b><i /><i /><i /></div>
            <div className="preview-nav">⌂ &nbsp; Dashboard</div>
            <div className="preview-line long" /><div className="preview-line" /><div className="preview-line" />
            <div className="preview-search">⌕</div>
            <div className="preview-card"><i /><i /><i /></div>
          </div>
        </div>
        <div className="reference-quote">
          <div className="quote-avatar">AM</div>
          <blockquote>&quot;What sold me was how fast the AI writes a job post. I type a title, it hands me a draft that sounds like a human wrote it, not a template.&quot;</blockquote>
          <strong>Alex M.</strong><small>CEO of Speciello Technologies</small>
          <div className="quote-dots"><b /><i /><i /></div>
        </div>
      </aside>
    </section>
  );
}
