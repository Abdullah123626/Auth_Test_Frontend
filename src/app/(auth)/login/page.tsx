"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api, cacheProfile, getApiErrorMessage } from "@/src/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (api.getSession()) router.replace("/dashboard");
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await api.login(
        String(formData.get("email") || "").trim(),
        String(formData.get("password") || ""),
      );
      if (!response.session) {
        setError("Login did not create a session. Please confirm your email or try again.");
        return;
      }
      if (response.user) {
        cacheProfile({ fullName: "", email: response.user.email || "", phone: "", bio: "", avatarUrl: null });
      }
      router.replace("/dashboard");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Unable to log in. Please check your details."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="reference-auth-shell">
      <div className="reference-form-panel">
        <div className="reference-form-content">
          <Link className="reference-logo" href="/" aria-label="Nexhire home"><span>✦</span></Link>
          <h1>Login to your account</h1>
          <p className="reference-subtitle">Enter your email below to login to your account.</p>

          {/* <div className="reference-socials">
            <button type="button" disabled><b className="google-icon">G</b> Login with Google</button>
            <button type="button" disabled><b className="linkedin-icon">in</b> Login with LinkedIn</button>
          </div> */}
          {/* <div className="reference-divider"><span>Or continue with</span></div> */}

          <form className="reference-login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="user@company.com" required />
            <div className="reference-label-row">
              <label htmlFor="password">Password</label>
            </div>
            <div className="reference-password">
              <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" required />
              <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "◉" : "◌"}</button>
            </div>
            <p className="reference-forgot">Can&apos;t login? <Link href="/forgot-password">forgot password</Link></p>
            {error && <p className="reference-error" role="alert">{error}</p>}
            <button className="reference-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Log in"}</button>
          </form>
          <p className="reference-switch">Don&apos;t have an account? <Link href="/signup">Sign up</Link></p>
        </div>
        <p className="reference-legal"><a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></p>
      </div>

      <aside className="reference-green-panel" aria-label="Nexhire product preview">
        <div className="green-panel-header"><span>✦</span></div>
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
          <blockquote>&quot;What sold me was how fast the AI writes a job post. I type a title, it hands me a draft that sounds like a human wrote it, not a template. We went from idea to published listing in under five minutes.&quot;</blockquote>
          <strong>Alex M.</strong><small>CEO of Speciello Technologies</small>
          <div className="quote-dots"><b /><i /><i /></div>
        </div>
      </aside>
    </section>
  );
}
