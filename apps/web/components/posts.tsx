"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button, Card, Input, Textarea } from "@/components/ui";

export type Post = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  author: { id: string; nickname: string };
};

export function PostCard({ post }: { post: Post }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span>{post.author.nickname}</span>
            <span>·</span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>

          <div className="block mt-2">
            <div className="text-base font-semibold tracking-tight text-zinc-50">{post.title}</div>
            <div className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap break-words">{post.body}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CreatePost({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch<{ id: string }>("/api/posts", {
        method: "POST",
        json: { title: title.trim(), body: body.trim() },
      });
      setTitle("");
      setBody("");
      onCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="text-sm font-semibold text-neon-300">Create post</div>
      <div className="mt-3 space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write something…" />
        {error ? (
          <div className="text-sm text-red-300 border border-red-500/20 bg-red-500/10 rounded-xl px-3 py-2">
            {error}
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button onClick={submit} disabled={busy || !title.trim() || !body.trim()}>
            {busy ? "Posting…" : "Post"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const rows = await apiFetch<Post[]>(`/api/posts`);
      setPosts(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { posts, loading, error, refresh };
}

