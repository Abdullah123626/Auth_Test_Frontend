"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/email-confirmed${window.location.search}${window.location.hash}`);
  }, [router]);

  return <main className="auth-loading-screen">Confirming your email...</main>;
}
