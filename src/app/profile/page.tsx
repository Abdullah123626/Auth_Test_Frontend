"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import type { UpdateProfileInput } from "@/src/lib/api-client";
import { api, cacheProfile, clearAuthState, getApiErrorMessage } from "@/src/lib/api";

type ProfileForm = { fullName: string; email: string; phone: string; role: string; bio: string; avatarUrl: string };

const emptyProfile: ProfileForm = { fullName: "", email: "", phone: "", role: "", bio: "", avatarUrl: "" };

export default function ProfilePage() {
  const router = useRouter();
  const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  useEffect(() => {
    if (isMounted && !api.getSession()) router.replace("/login");
  }, [isMounted, router]);

  useEffect(() => {
    if (!isMounted || !api.getSession()) return;
    let active = true;
    api.getMyProfile().then((data) => {
      if (!active) return;
      setProfile({
        fullName: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        role: data.role || "user",
        bio: data.bio || "",
        avatarUrl: data.avatar_url || "",
      });
    }).catch((loadError) => {
      if (active) setError(getApiErrorMessage(loadError, "Unable to load your profile."));
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [isMounted]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    const formData = new FormData(event.currentTarget);
    const next = {
      fullName: String(formData.get("fullName") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      avatarUrl: String(formData.get("avatarUrl") || "").trim(),
      bio: String(formData.get("bio") || "").trim(),
    };

    if (next.avatarUrl && !/^https?:\/\//i.test(next.avatarUrl)) {
      setError("Avatar URL must start with http:// or https://.");
      return;
    }

    // Doc: sirf badle hue fields bhejo; khali string field ko clear kar deti hai.
    const changes: UpdateProfileInput = {};
    if (next.fullName !== profile.fullName) changes.fullName = next.fullName;
    if (next.phone !== profile.phone) changes.phone = next.phone;
    if (next.avatarUrl !== profile.avatarUrl) changes.avatarUrl = next.avatarUrl;
    if (next.bio !== profile.bio) changes.bio = next.bio;
    if (Object.keys(changes).length === 0) {
      setError("There are no changes to save.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await api.updateMyProfile(changes);
      const nextProfile: ProfileForm = {
        fullName: updated.full_name || "",
        email: updated.email || profile.email,
        phone: updated.phone || "",
        role: updated.role || profile.role,
        bio: updated.bio || "",
        avatarUrl: updated.avatar_url || "",
      };
      setProfile(nextProfile);
      cacheProfile({ fullName: nextProfile.fullName, email: nextProfile.email, phone: nextProfile.phone, bio: nextProfile.bio, avatarUrl: nextProfile.avatarUrl || null });
      setSaved(true);
      setTimeout(() => router.push("/dashboard"), 700);
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to save your profile."));
    } finally {
      setIsSaving(false);
    }
  }

  // Password sirf email wale reset link se badalta hai, is liye reset email bhejte hain.
  async function handleSendResetLink() {
    if (!profile.email) return;
    setSecurityError("");
    setSecurityMessage("");
    setIsSendingReset(true);
    try {
      const response = await api.forgotPassword(profile.email);
      setSecurityMessage(response.message || "If an account exists for this email, a password reset link has been sent.");
    } catch (resetError) {
      setSecurityError(getApiErrorMessage(resetError, "Unable to send the reset email."));
    } finally {
      setIsSendingReset(false);
    }
  }

  async function handleChangeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError("");
    setEmailMessage("");
    const form = event.currentTarget;
    const newEmail = String(new FormData(form).get("newEmail") || "").trim();
    if (!newEmail) return;

    setIsChangingEmail(true);
    try {
      const response = await api.changeEmail(newEmail);
      setEmailMessage(response.message || "Confirmation email sent. Your email will change only after you confirm the link sent to your email.");
      form.reset();
    } catch (changeError) {
      setEmailError(getApiErrorMessage(changeError, "Unable to change your email."));
    } finally {
      setIsChangingEmail(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // Logout fail ho tab bhi local auth state clear karni hai.
    } finally {
      clearAuthState();
      setIsLoggingOut(false);
      router.replace("/login");
    }
  }

  if (!isMounted || !api.getSession()) return <main className="auth-loading-screen">Loading your profile...</main>;

  const displayName = profile.fullName || "Your profile";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-logo" href="/dashboard"><span>✦</span> Dashboard</Link>
        <p className="dashboard-label">Workspace</p>
        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link href="/dashboard"><span className="nav-icon">⌂</span>Overview</Link>

        </nav>
        <nav className="dashboard-nav"><button className="active"><span className="nav-icon">⚙</span>Settings</button><button><span className="nav-icon">?</span>Help center</button></nav>
        <div className="sidebar-footer"><div className="mini-avatar">{initials}</div><div><strong>{displayName}</strong><small>{profile.email || "Profile email"}</small></div></div>
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-header profile-header"><div><p className="dashboard-kicker">Workspace settings</p><h1>Profile settings</h1></div><div className="dashboard-actions"><Link className="back-dashboard" href="/dashboard">← Back to overview</Link><div className="account-menu"><button className="profile-menu-button" aria-label="Open profile menu" onClick={() => setMenuOpen(!menuOpen)}>•••</button>{menuOpen && <div className="account-popover"><strong>{displayName}</strong><Link href="/profile">Profile settings</Link><button type="button" onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? "Logging out..." : "Log out"}</button></div>}</div></div></header>
        <div className="profile-content">
          <div className="profile-intro"><div className="profile-avatar-block"><div className="large-profile-avatar">{profile.avatarUrl ? <Image src={profile.avatarUrl} alt={`${displayName} profile`} width={65} height={65} unoptimized /> : initials}</div></div><div><p className="dashboard-kicker">Your account</p><h2>{displayName}</h2><p>{profile.role || "user"} · {profile.email || "Profile email"}</p></div></div>
          <div className="profile-layout">
            <section className="dashboard-card profile-card">
              <div className="card-heading">
                <div>
                  <h3>Personal information</h3>
                  <p>Keep your profile details up to date.</p>
                  </div>
                  </div>
                  {isLoading ? <p className="profile-loading">Loading your profile...</p> : <form className="profile-fields" onSubmit={handleSubmit}>
                    <label>Full name<input name="fullName" defaultValue={profile.fullName} maxLength={100} />
                    </label>
                    <label>Email<input name="email" value={profile.email || "Not available"} readOnly type="email" />
                    </label>
                    <label>Phone number<input name="phone" type="tel" defaultValue={profile.phone} placeholder="+92 300 1234567" />
                    </label>
                    <label>Role<input name="role" value={profile.role} readOnly />
                    </label>
                    <label className="full-field">Avatar URL<input name="avatarUrl" type="url" defaultValue={profile.avatarUrl} maxLength={2048} placeholder="https://example.com/avatar.png" />
                    </label>
                    <label className="full-field">Bio<textarea name="bio" defaultValue={profile.bio} maxLength={500} rows={4} />
                    </label>
                    <div className="profile-actions">
                      <button className="cancel-button" type="reset">Cancel</button>
                      <button className="save-button" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button>
                    </div>
                  </form>}
                  {error && <p className="reference-error profile-error" role="alert">{error}</p>}
                  {saved && <p className="profile-success">Profile updated successfully.</p>}</section>
            <aside className="profile-side">
              <section className="dashboard-card security-card">
                <div className="setting-icon">⌁</div>
                <h3>Security</h3>
                <p>We&apos;ll email you a secure link to set a new password.</p>
                <button type="button" onClick={handleSendResetLink} disabled={isSendingReset || !profile.email}>{isSendingReset ? "Sending..." : "Send password reset link"} <span>→</span>
                </button>
                {securityMessage && <p className="profile-success" role="status">{securityMessage}</p>}
                {securityError && <p className="reference-error" role="alert">{securityError}</p>}
                </section>
              <section className="dashboard-card security-card">
                <div className="setting-icon">@</div>
                <h3>Change email</h3>
                <p>Your email changes only after you confirm the link we send.</p>
                <form className="profile-fields single-column" onSubmit={handleChangeEmail}>
                  <label>New email<input name="newEmail" type="email" placeholder="new@example.com" required />
                  </label>
                  <button type="submit" disabled={isChangingEmail}>{isChangingEmail ? "Sending..." : "Send confirmation"} <span>→</span></button>
                </form>
                {emailMessage && <p className="profile-success" role="status">{emailMessage}</p>}
                {emailError && <p className="reference-error" role="alert">{emailError}</p>}
                </section>
                <section className="dashboard-card workspace-card">
                  <div className="workspace-card-top">
                    <div className="setting-icon green-icon">✦</div>
                    <span>PRO PLAN</span>
                    </div>
                    <h3>Nextwire workspace</h3>
                    <p>You are the workspace admin with full access to hiring tools.</p>
                    <button>Manage workspace <span>→</span>
                    </button>
                    </section>
                    </aside>
          </div>
        </div>
      </section>

    </main>
  );
}
