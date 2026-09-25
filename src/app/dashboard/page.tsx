"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { api, clearCachedProfile, getApiErrorMessage, getCachedProfile, type CachedProfile } from "@/src/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<CachedProfile | null>(null);

  useEffect(() => {
    if (isMounted && !api.getSession()) {
      router.replace("/login");
    }
  }, [isMounted, router]);

  useEffect(() => {
    if (!isMounted || !api.getSession()) return;
    api.getMyProfile().then((data) => {
      const cached = getCachedProfile();
      setProfile({
        fullName: data.full_name || cached?.fullName || "User",
        email: cached?.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        avatarUrl: cached?.avatarUrl || data.avatar_url || null,
      });
    }).catch((loadError) => setError(getApiErrorMessage(loadError, "Unable to load your profile.")));
  }, [isMounted]);

  async function handleLogout() {
    setError("");
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

  if (!isMounted || !api.getSession()) return <main className="auth-loading-screen">Loading your workspace...</main>;

  return (
    <main className="dashboard-shell simple-dashboard">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-logo" href="/dashboard"><span>✦</span> Dashboard</Link>
        <p className="dashboard-label">Account</p>
        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link className="active" href="/dashboard"><span className="nav-icon">⌂</span>Overview</Link>
          <Link href="/profile"><span className="nav-icon">⚙</span>Settings</Link>
        </nav>
        <div className="sidebar-footer"><div className="mini-avatar">{profile?.fullName?.slice(0, 2).toUpperCase() || "U"}</div><div><strong>{profile?.fullName || "Your profile"}</strong><small>{profile?.email || "Profile email"}</small></div></div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header"><div><p className="dashboard-kicker">Personal workspace</p><h1>Welcome back, {profile?.fullName?.split(" ")[0] || "there"} <span>✦</span></h1></div><div className="dashboard-actions"><div className="account-menu"><button className="header-avatar" onClick={() => setMenuOpen(!menuOpen)}>{profile?.fullName?.slice(0, 2).toUpperCase() || "U"}</button>{menuOpen && <div className="account-popover"><strong>{profile?.fullName || "Your profile"}</strong><Link href="/profile">Profile settings</Link><button type="button" onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? "Logging out..." : "Log out"}</button></div>}</div></div></header>
        <div className="dashboard-content simple-dashboard-content">
          <div className="simple-welcome"><div><p className="dashboard-kicker">Your account</p><h2>Manage your profile</h2><p>Keep your personal information up to date from one simple place.</p><Link className="save-button simple-profile-button" href="/profile">Open profile settings <span>→</span></Link></div><div className="simple-welcome-mark">✦</div></div>
          <section className="dashboard-card simple-account-card"><div className="simple-account-heading"><div className="large-profile-avatar">{profile?.avatarUrl ? <Image src={profile.avatarUrl} alt="Profile" width={48} height={48} unoptimized /> : (profile?.fullName || "User").slice(0, 2).toUpperCase()}</div><div><h3>{profile?.fullName || "Your profile"}</h3><p>{profile?.email || "Profile email"}</p></div><Link className="simple-edit-link" href="/profile">Edit profile →</Link></div><div className="simple-account-details"><div><span>Full name</span><strong>{profile?.fullName || "Not set"}</strong></div><div><span>Email address</span><strong>{profile?.email || "Not available"}</strong></div><div><span>Account status</span><strong className="status-active"><i /> Active</strong></div></div></section>
          <section className="dashboard-card simple-security-card"><div className="setting-icon green-icon">⚙</div><div><h3>Account settings</h3><p>Update your profile details or change your password whenever you need.</p></div><Link href="/profile">Manage settings <span>→</span></Link></section>
          {error && <p className="reference-error dashboard-error" role="alert">{error}</p>}
        </div>
      </section>
    </main>
  );
}
