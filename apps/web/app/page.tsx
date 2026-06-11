import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function HomePage() {
  return (
    <Card className="p-6">
      <div className="text-xl font-semibold tracking-tight">TORtick</div>
      <div className="mt-1 text-sm text-zinc-400">Communication without surveillance.</div>
      <div className="mt-4">
        <Link href="/feed">
          <Button>Open feed</Button>
        </Link>
      </div>
    </Card>
  );
}

