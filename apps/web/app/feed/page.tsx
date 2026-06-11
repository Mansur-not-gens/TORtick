"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Card } from "@/components/ui";
import { CreatePost, PostCard, usePosts } from "@/components/posts";

export default function FeedPage() {
  // Получаем базовые посты из твоего хука
  const { posts: fetchedPosts, loading, error, refresh } = usePosts();
  
  // Локальное состояние, которое будет объединять посты из базы и живые посты по сокетам
  const [posts, setPosts] = useState<typeof fetchedPosts>([]);

  // Синхронизируем локальные посты, когда хук загружает данные из БД
  useEffect(() => {
    if (fetchedPosts) {
      setPosts(fetchedPosts);
    }
  }, [fetchedPosts]);

  // Подключаем Socket.IO для ловли новых постов на лету
  useEffect(() => {
    const socket = io("http://localhost:4000", {
      withCredentials: true,
    });

    socket.on("new_post", (newPost) => {
      setPosts((prev) => {
        // Защита от дубликатов (если этот пост создал ты сам, и он уже прилетел через refresh)
        if (prev.some((p) => p.id === newPost.id)) return prev;
        // Добавляем новый пост на самую верхнюю строчку ленты
        return [newPost, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div>
            <div className="text-xl font-semibold tracking-tight">Feed</div>
            <div className="text-sm text-zinc-400">Anonymous posts. Cookie session auth.</div>
          </div>
        </div>

        {/* При создании поста всё так же вызываем refresh для надежности */}
        <CreatePost onCreated={refresh} />

        <div className="space-y-3">
          {loading && posts.length === 0 ? (
            <div className="text-sm text-zinc-400">Loading…</div>
          ) : error ? (
            <Card className="p-5">
              <div className="text-sm font-semibold text-red-300">Failed to load feed</div>
              <div className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap break-words">{error}</div>
              <div className="mt-4">
                <button
                  className="rounded-xl px-4 py-2 text-sm font-medium border border-white/10 hover:border-neon-500/20 hover:bg-white/5"
                  onClick={refresh}
                >
                  Retry
                </button>
              </div>
            </Card>
          ) : posts.length === 0 ? (
            <div className="text-sm text-zinc-400">No posts yet. Create the first one.</div>
          ) : (
            // Рендерим наш объединенный живой массив постов
            posts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="text-sm font-semibold text-neon-300">How TORtick works</div>
          <div className="mt-2 text-sm text-zinc-300 space-y-2">
            <p>Every visitor gets a cookie-backed anonymous user (`tortick.sid`).</p>
            <p>Posts are stored in Postgres (Supabase) and returned newest-first.</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold text-neon-300">Next</div>
          <div className="mt-2 text-sm text-zinc-300">Comments, communities, and chat come after posts.</div>
        </Card>
      </div>
    </div>
  );
}