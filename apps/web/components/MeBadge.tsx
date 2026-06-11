"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Me = { id: string; nickname: string };

export function MeBadge() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let alive = true;
    apiFetch<Me>("/api/me")
      .then((x) => {
        if (alive) setMe(x);
      })
      .catch(() => {
        if (alive) setMe(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="text-xs rounded-xl border border-white/10 bg-black/25 px-3 py-2">
      <span className="text-zinc-400">session</span>{" "}
      <span className="text-neon-300">{me?.nickname ?? "…"}</span>
    </div>
  );
}

