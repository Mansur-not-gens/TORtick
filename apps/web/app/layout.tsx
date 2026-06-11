import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "TORtick",
  description: "Communication without surveillance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh bg-grid-fade">
          <AppShell>{children}</AppShell>
        </div>
      </body>
    </html>
  );
}

