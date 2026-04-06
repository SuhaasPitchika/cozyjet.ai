"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/dashboard/skippy");
      return;
    }

    api.get("/backend/api/onboarding/status")
      .then(({ data }) => {
        if (!data.is_complete) {
          router.replace("/dashboard/onboarding");
        } else {
          router.replace("/dashboard/skippy");
        }
      })
      .catch(() => {
        router.replace("/dashboard/skippy");
      });
  }, [router]);

  return (
    <div className="h-full flex items-center justify-center" style={{ background: "#f0ece6" }}>
      <div className="w-8 h-8 border-4 border-black/10 border-t-black/40 rounded-full animate-spin" />
    </div>
  );
}