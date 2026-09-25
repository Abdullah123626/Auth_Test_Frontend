"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { api, getApiErrorMessage } from "@/src/lib/api";

export default function ForgotPasswordPage() {
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);
		const formData = new FormData(event.currentTarget);
		try {
			await api.forgotPassword(String(formData.get("email") || "").trim());
			setSubmitted(true);
		} catch (submitError) {
			setError(getApiErrorMessage(submitError, "Unable to send the reset email."));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="reference-auth-shell">
			<div className="reference-form-panel">
				<div className="reference-form-content reference-reset-content">
					<Link className="reference-logo" href="/" aria-label="Nexhire home"><span>✦</span></Link>
					<h1>Forgot password?</h1>
					<p className="reference-subtitle">Enter your email and we&apos;ll send you instructions<br />to reset your password.</p>

					<form className="reference-login-form" onSubmit={handleSubmit}>
						<label htmlFor="forgot-email">Email</label>
						<input id="forgot-email" name="email" type="email" placeholder="user@company.com" required />
						{error && <p className="reference-error" role="alert">{error}</p>}
						<button className="reference-submit reference-reset-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send reset link"}</button>
						{submitted && <p className="reference-success">If this email exists, a reset link is on its way.</p>}
					</form>
					<p className="reference-switch reference-back-link"><Link href="/login">Go to Login page</Link></p>
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
