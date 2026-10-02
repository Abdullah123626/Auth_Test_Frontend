"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, getApiErrorMessage, setPendingEmail, validatePassword } from "@/src/lib/api";

export default function SignupPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setSuccess("");
		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") || "").trim();
		const password = String(formData.get("password") || "");
		const confirmPassword = String(formData.get("confirmPassword") || "");
		const passwordError = validatePassword(password);
		if (passwordError) { setError(passwordError); return; }
		if (password !== confirmPassword) { setError("Passwords do not match."); return; }

		setIsSubmitting(true);
		try {
			// Signup hamesha verification-pending hota hai; session nahi milta.
			await api.signup(email, password);
			setPendingEmail(email);
			router.replace("/check-email");
		} catch (submitError) {
			setError(getApiErrorMessage(submitError, "Unable to create your account."));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="reference-auth-shell">
			<div className="reference-form-panel">
				<div className="reference-form-content reference-signup-content">
					<Link className="reference-logo" href="/" aria-label="Nexhire home"><span>✦</span></Link>
					<h1>Create your account</h1>
					<p className="reference-subtitle">Start your 14-day free trial. No credit card required.</p>

					{/* <div className="reference-socials">
						<button type="button"><b className="google-icon">G</b> Sign up with Google</button>
						<button type="button"><b className="linkedin-icon">in</b> Sign up with LinkedIn</button>
					</div>
					<div className="reference-divider"><span>Or continue with</span></div> */}

					<form className="reference-login-form" onSubmit={handleSubmit}>
						<label htmlFor="signup-email">Email</label>
						<input id="signup-email" name="email" type="email" placeholder="user@company.com" required />

						<label htmlFor="signup-password">Password</label>
						<div className="reference-password">
							<input id="signup-password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" required />
							<button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "◉" : "◌"}</button>
						</div>

						<label htmlFor="confirm-password">Confirm password</label>
						<div className="reference-password">
							<input id="confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Enter your password" required />
							<button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? "◉" : "◌"}</button>
						</div>

						{error && <p className="reference-error" role="alert">{error}</p>}
						{success && <p className="reference-success" role="status">{success}</p>}
						<button className="reference-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</button>
					</form>
					<p className="reference-switch">Already have an account? <Link href="/login">Log in</Link></p>
					<p className="reference-switch">Forgot your password? <Link href="/forgot-password">Reset it</Link></p>
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
