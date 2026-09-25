"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { api, cacheProfile, clearCachedProfile, getApiErrorMessage, getCachedProfile } from "@/src/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState({ fullName: "", email: "", phone: "", role: "", bio: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    api.getMyProfile().then((data) => {
      if (!active) return;
      const cached = getCachedProfile();
      setProfile({ fullName: data.full_name || "", email: cached?.email || "", phone: data.phone || "", role: "", bio: data.bio || "" });
      setAvatarUrl(cached?.avatarUrl || data.avatar_url || null);
    }).catch((loadError) => {
      if (active) setError(getApiErrorMessage(loadError, "Unable to load your profile."));
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => setAvatarUrl(String(reader.result)));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    try {
      const updated = await api.updateMyProfile({
        fullName: String(formData.get("fullName") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        bio: String(formData.get("bio") || "").trim(),
      });
      setProfile((current) => ({ ...current, fullName: updated.full_name || "", phone: updated.phone || "", bio: updated.bio || "" }));
      setAvatarUrl(updated.avatar_url || avatarUrl);
      cacheProfile({ fullName: updated.full_name || "", email: profile.email, phone: updated.phone || "", bio: updated.bio || "", avatarUrl: updated.avatar_url || avatarUrl });
      setSaved(true);
      setTimeout(() => router.push("/dashboard"), 700);
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to save your profile."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await api.logout();
      clearCachedProfile();
      router.replace("/login");
    } catch (logoutError) {
      setError(getApiErrorMessage(logoutError, "Unable to log out right now."));
      clearCachedProfile();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

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
          <div className="profile-intro"><div className="profile-avatar-block"><div className="large-profile-avatar">{avatarUrl ? <Image src={avatarUrl} alt={`${displayName} profile`} width={65} height={65} unoptimized /> : initials}</div><div className="avatar-actions"><button type="button" onClick={() => fileInputRef.current?.click()}>Change photo</button>{avatarUrl && <button type="button" onClick={() => { setAvatarUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>Remove</button>}<input ref={fileInputRef} className="avatar-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} /></div></div><div><p className="dashboard-kicker">Your account</p><h2>{displayName}</h2><p>Workspace admin · {profile.email || "Profile email"}</p></div></div>
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
                    <label>Work email<input name="email" value={profile.email || "Not available"} readOnly type="email" />
                    </label>
                    <label>Phone number<input name="phone" defaultValue={profile.phone} maxLength={30} placeholder="+92 0000000000" />
                    </label>
                    <label>Role<input name="role" defaultValue={profile.role} readOnly placeholder="Workspace member" />
                    </label>
                    <label className="full-field">Bio<textarea name="bio" defaultValue={profile.bio} maxLength={500} rows={4} />
                    </label>
                    <div className="profile-actions">
                      <button className="cancel-button" type="button">Cancel</button>
                      <button className="save-button" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button>
                    </div>
                  </form>}
                  {error && <p className="reference-error profile-error" role="alert">{error}</p>}
                  {saved && <p className="profile-success">Profile updated successfully.</p>}</section>
            <aside className="profile-side">
              <section className="dashboard-card security-card">
                <div className="setting-icon">⌁</div>
                <h3>Security</h3>
                <p>Manage your password and account access.</p>
                <Link href="/reset-password?from=dashboard">Change password <span>→</span>
                </Link>
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
