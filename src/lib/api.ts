import { ApiError, BackendApiClient, type Session, type TokenStore } from "./api-client";

export type CachedProfile = {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string | null;
};

const profileCacheKey = "nexhire.profile";
const sessionStorageKey = "nexhire.session";
const pendingEmailKey = "nexhire.pending-email";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

class BrowserTokenStore implements TokenStore {
  getSession(): Session | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.sessionStorage.getItem(sessionStorageKey);
      return stored ? (JSON.parse(stored) as Session) : null;
    } catch {
      return null;
    }
  }

  setSession(session: Session) {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(sessionStorageKey, JSON.stringify(session));
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }

  clear() {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(sessionStorageKey);
  }
}

export const api = new BackendApiClient(apiBaseUrl, new BrowserTokenStore());

export function getCachedProfile(): CachedProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = window.sessionStorage.getItem(profileCacheKey);
    return cached ? (JSON.parse(cached) as CachedProfile) : null;
  } catch {
    return null;
  }
}

export function cacheProfile(profile: CachedProfile) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(profileCacheKey, JSON.stringify(profile));
  } catch {
    // A large local image or restricted storage should not block profile updates.
  }
}

export function clearCachedProfile() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(profileCacheKey);
}

export function setPendingEmail(email: string) {
  if (typeof window !== "undefined") window.sessionStorage.setItem(pendingEmailKey, email);
}

export function getPendingEmail() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(pendingEmailKey) || "";
}

export function clearPendingEmail() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(pendingEmailKey);
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiError) {
    if (error.statusCode === 400) {
      return error.details ? (Array.isArray(error.details) ? error.details.join(" ") : error.details) : error.message;
    }
    if (error.statusCode === 401) return "Your session is invalid or your credentials are incorrect.";
    if (error.statusCode === 403) return error.message || "Please verify your email before logging in.";
    if (error.statusCode === 404) return "The requested account or profile was not found.";
    if (error.statusCode === 429) return "Too many attempts. Please wait a moment and try again.";
    if (error.statusCode >= 500) return "The service is temporarily unavailable. Please try again shortly.";
    return error.message;
  }

  if (error instanceof TypeError) {
    return "Unable to reach the server. Check that the backend is running.";
  }

  return fallback;
}

export function validatePassword(password: string) {
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (password.length > 128) return "Password must be 128 characters or fewer.";
  if (/\s/.test(password)) return "Password cannot contain spaces.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return "Password needs a lowercase letter, uppercase letter, number and symbol.";
  }
  return "";
}
