"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasConfirmationResult = window.location.hash.includes("access_token") || window.location.search.includes("error=");
    router.replace(hasConfirmationResult ? `/email-confirmed${window.location.search}${window.location.hash}` : "/login");
  }, [router]);

  return <main className="auth-loading-screen">Opening Nexhire...</main>;
}
