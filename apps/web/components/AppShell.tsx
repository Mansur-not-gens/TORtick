"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { MeBadge } from "@/components/MeBadge";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={clsx(
        "text-sm px-3 py-2 rounded-xl border transition",
        active
          ? "border-neon-500/30 bg-neon-500/10 text-neon-300"
          : "border-white/10 hover:border-neon-500/20 hover:bg-white/5 text-zinc-200",
      )}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-neon-500/15 border border-neon-500/25 grid place-items-center text-neon-300 font-semibold">
            T
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight">TORtick</div>
            <div className="text-xs text-zinc-400">Communication without surveillance.</div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink href="/feed" label="Feed" />
          <NavLink href="/profile" label="Profile" />
        </nav>

        <div className="flex items-center justify-end">
          <MeBadge />
        </div>
      </header>

      <main>{children}</main>
      <footer className="mt-10 text-xs text-zinc-500">
        MVP demo build. No email. No phone. Just a session cookie.
      </footer>
    </div>
  );
}

