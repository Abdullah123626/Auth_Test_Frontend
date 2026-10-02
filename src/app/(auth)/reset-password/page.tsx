"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ApiError } from "@/src/lib/api-client";
import { api, clearAuthState, getApiErrorMessage, validatePassword } from "@/src/lib/api";

const expiredLinkMessage = "This reset link is invalid or has expired. Please request a new link.";

export default function ResetPasswordPage() {
	const router = useRouter();
	const accessTokenRef = useRef<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [linkExpired, setLinkExpired] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		// Token sirf memory mein rakho aur URL se foran hata do.
		if (!window.location.hash) return;
		accessTokenRef.current = new URLSearchParams(window.location.hash.slice(1)).get("access_token");
		window.history.replaceState(null, "", window.location.pathname);
	}, []);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setSubmitted(false);
		const formData = new FormData(event.currentTarget);
		const password = String(formData.get("password") || "");
		const confirmPassword = String(formData.get("confirmPassword") || "");
		const passwordError = validatePassword(password);
		if (passwordError) { setError(passwordError); return; }
		if (password !== confirmPassword) { setError("Passwords do not match."); return; }
		const accessToken = accessTokenRef.current;
		if (!accessToken) { setError(expiredLinkMessage); setLinkExpired(true); return; }

		setIsSubmitting(true);
		try {
			await api.resetPassword(accessToken, password);
			// Backend user ke saare sessions logout kar deta hai.
			accessTokenRef.current = null;
			clearAuthState();
			setSubmitted(true);
			setTimeout(() => router.replace("/login"), 1400);
		} catch (submitError) {
			if (submitError instanceof ApiError && submitError.statusCode === 401) {
				setError(expiredLinkMessage);
				setLinkExpired(true);
				return;
			}
			setError(getApiErrorMessage(submitError, "Unable to update your password."));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="reference-auth-shell">
			<div className="reference-form-panel">
				<div className="reference-form-content reference-reset-content">
					<Link className="reference-logo" href="/" aria-label="Nexhire home"><span>✦</span></Link>
					<h1>Set new password</h1>
					<p className="reference-subtitle">Create a new password to keep your<br /> account secure.</p>

					<form className="reference-login-form" onSubmit={handleSubmit}>
						<label htmlFor="new-password">New password</label>
						<div className="reference-password">
							<input id="new-password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter new password" required />
							<button type="button" aria-label="Toggle new password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "◉" : "◌"}</button>
						</div>
						<label htmlFor="confirm-new-password">Confirm password</label>
						<div className="reference-password">
							<input id="confirm-new-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" required />
							<button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? "◉" : "◌"}</button>
						</div>
						<p className="password-hint">Use 12+ characters with uppercase,lowercase, number and symbol.</p>
						{error && <p className="reference-error" role="alert">{error}{linkExpired && <> <Link href="/forgot-password">Request a new link</Link></>}</p>}
						<button className="reference-submit reference-reset-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update password"}</button>
						{submitted && <p className="reference-success">Password reset successfully. Please log in with your new password.</p>}
					</form>
					<p className="reference-switch reference-back-link"><Link href="/login">Back to Log in</Link></p>
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
