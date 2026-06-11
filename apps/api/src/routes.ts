import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { query } from "./db.js";

export const api = Router();

api.get("/health", (_req, res) => res.json({ ok: true }));

function generateNickname() {
  const suffix = Math.random().toString(16).slice(2, 6);
  return `anon-${suffix}`;
}

function isUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

async function getOrCreateMe(req: any, res: any) {
  const cookieId = req.cookies?.["tortick.sid"];
  const userId = isUuid(cookieId) ? cookieId : randomUUID();

  const found = await query<{ id: string; nickname: string }>(
    "select id, nickname from public.users where id = $1",
    [userId],
  );

  if (found.rows[0]) {
    if (userId !== cookieId) {
      res.cookie("tortick.sid", userId, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        path: "/",
      });
    }
    return found.rows[0];
  }

  const nickname = generateNickname();
  const created = await query<{ id: string; nickname: string }>(
    "insert into public.users (id, nickname) values ($1, $2) returning id, nickname",
    [userId, nickname],
  );

  res.cookie("tortick.sid", userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    path: "/",
  });

  return created.rows[0]!;
}

api.get("/me", async (req, res, next) => {
  try {
    const me = await getOrCreateMe(req, res);
    return res.json(me);
  } catch (err) {
    return next(err);
  }
});

// --- СООБЩЕСТВА (COMMUNITIES) ---

// Получить список всех сообществ
api.get("/communities", async (_req, res, next) => {
  try {
    const rows = await query<{ id: string; slug: string; name: string; description: string | null; created_at: string }>(
      "select id, slug, name, description, created_at from public.communities order by name asc"
    );
    return res.json(rows.rows);
  } catch (err) {
    return next(err);
  }
});

// Создать новое сообщество
api.post("/communities", async (req, res, next) => {
  try {
    await getOrCreateMe(req, res);
    const Body = z.object({
      slug: z.string().min(2).max(50),
      name: z.string().min(2).max(100),
      description: z.string().max(1000).optional(),
    });
    const body = Body.parse(req.body);
    const cleanSlug = body.slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");

    const created = await query<{ id: string; slug: string; name: string; description: string | null }>(
      "insert into public.communities (slug, name, description) values ($1, $2, $3) returning id, slug, name, description",
      [cleanSlug, body.name, body.description || null]
    );
    return res.status(201).json(created.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Этот адрес (slug) уже занят" });
    }
    return next(err);
  }
});

// --- ПОСТЫ (POSTS) ---

// Создать пост (с автоматическим вещанием в Socket.IO)
api.post("/posts", async (req, res, next) => {
  try {
    const me = await getOrCreateMe(req, res);
    const Body = z.object({
      title: z.string().min(3).max(160),
      body: z.string().min(1).max(5000),
      community_id: z.string().uuid().nullable().optional(),
    });
    const body = Body.parse(req.body);

    const created = await query<{ id: string; created_at: string }>(
      "insert into public.posts (author_id, title, body, community_id) values ($1, $2, $3, $4) returning id, created_at",
      [me.id, body.title, body.body, body.community_id || null],
    );

    // Полный объект нового поста, который ожидает фронтенд в `PostCard`
    const newPost = {
      id: created.rows[0]!.id,
      title: body.title,
      body: body.body,
      created_at: created.rows[0]!.created_at,
      author: { id: me.id, nickname: me.nickname },
      community_slug: null
    };

    // 📢 Отправляем новый пост всем подключенным пользователям по сокетам
    const io = req.app.get("io");
    if (io) {
      io.emit("new_post", newPost);
      console.log(`[Socket.IO] Успешно отправили новый пост от @${me.nickname}`);
    } else {
      console.error("❌ Ошибка: Socket.IO не привязан к Express! Проверь, добавлен ли app.set('io', io) в главном файле сервера.");
    }

    return res.status(201).json({
      id: created.rows[0]!.id,
      created_at: created.rows[0]!.created_at,
    });
  } catch (err) {
    return next(err);
  }
});

// Получить посты (все или конкретного сообщества по ?community=slug)
api.get("/posts", async (req, res, next) => {
  try {
    const communitySlug = req.query.community;
    
    let sql = `
      select
        p.id,
        p.title,
        p.body,
        p.created_at,
        json_build_object('id', u.id, 'nickname', u.nickname) as author,
        c.slug as community_slug
      from public.posts p
      join public.users u on u.id = p.author_id
      left join public.communities c on c.id = p.community_id
      where p.deleted_at is null
    `;
    const params: any[] = [];

    if (typeof communitySlug === "string" && communitySlug.trim() !== "") {
      sql += " and c.slug = $1";
      params.push(communitySlug);
    }

    sql += " order by p.created_at desc limit 50";

    const rows = await query<{
      id: string;
      title: string;
      body: string;
      created_at: string;
      author: { id: string; nickname: string };
      community_slug: string | null;
    }>(sql, params);

    return res.json(rows.rows);
  } catch (err) {
    return next(err);
  }
});

api.get("/posts/:id", async (req, res, next) => {
  try {
    const postId = req.params.id!;
    const post = await query<{
      id: string;
      title: string;
      body: string;
      created_at: string;
      author: { id: string; nickname: string };
    }>(
      `
select
  p.id,
  p.title,
  p.body,
  p.created_at,
  json_build_object('id', u.id, 'nickname', u.nickname) as author
from public.posts p
join public.users u on u.id = p.author_id
where p.id = $1 and p.deleted_at is null
`,
      [postId],
    );

    if (!post.rows[0]) return res.status(404).json({ error: "Not found" });
    return res.json(post.rows[0]);
  } catch (err) {
    return next(err);
  }
});

api.delete("/posts/:id", async (req, res, next) => {
  try {
    const postId = req.params.id!;
    await query("update public.posts set deleted_at = now() where id = $1", [postId]);
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

// --- ЧАТ (CHAT HISTORY) ---

// Получить историю сообщений для конкретного чата
api.get("/chat/:communityId/messages", async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const rows = await query<{
      id: string;
      body: string;
      created_at: string;
      author: { id: string; nickname: string };
    }>(
      `
      select 
        m.id, 
        m.body, 
        m.created_at, 
        json_build_object('id', u.id, 'nickname', u.nickname) as author
      from public.chat_messages m
      join public.users u on m.author_id = u.id
      where m.community_id = $1
      order by m.created_at asc 
      limit 50
      `,
      [communityId]
    );
    return res.json(rows.rows);
  } catch (err) {
    return next(err);
  }
});