"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui";

type Me = { id: string; nickname: string };

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);

  async function refresh() {
    const m = await apiFetch<Me>("/api/me");
    setMe(m);
  }

  useEffect(() => {
    refresh().catch(() => setMe(null));
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
      <Card className="p-6">
        <div className="text-xl font-semibold tracking-tight">Profile</div>
        <div className="mt-1 text-sm text-zinc-400">Nickname only. No identity.</div>

        <div className="mt-6 space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="text-xs text-zinc-400">Nickname</div>
            <div className="mt-1 text-sm text-neon-300">{me?.nickname ?? "…"}</div>
          </div>
          <div className="text-xs text-zinc-500">
            Editing nickname will be added later (requires `PATCH /api/me`).
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm font-semibold text-neon-300">Session details</div>
        <div className="mt-3 text-sm text-zinc-300 space-y-2">
          <div>
            <span className="text-zinc-400">User ID:</span>{" "}
            <span className="font-mono text-xs">{me?.id ?? "…"}</span>
          </div>
          <div>
            <span className="text-zinc-400">Current nickname:</span> <span>{me?.nickname ?? "…"}</span>
          </div>
          <div className="text-xs text-zinc-500">
            This is an anonymous cookie session. Clearing cookies creates a new user.
          </div>
        </div>
      </Card>
    </div>
  );
}

