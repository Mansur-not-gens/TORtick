import type { Server as HttpServer } from "http";
import type { RequestHandler } from "express";
import { Server } from "socket.io";
import { env } from "./env.js";
import { query } from "./db.js";

export function attachSocket(server: HttpServer, sessionMiddleware: RequestHandler) {
  const io = new Server(server, {
    cors: {
      origin: env.WEB_ORIGIN,
      credentials: true,
    },
  });

  // Reuse Express session middleware for Socket.IO
  io.use((socket, next) => {
    // @ts-expect-error express-session expects (req,res,next); Socket.IO provides req only.
    sessionMiddleware(socket.request, {}, next);
  });

  io.on("connection", (socket) => {
    const reqAny = socket.request as any;
    const userId: string | undefined = reqAny.session?.userId;

    socket.on("joinCommunity", (payload: { communityId: string }) => {
      socket.join(`community:${payload.communityId}`);
    });

    socket.on("leaveCommunity", (payload: { communityId: string }) => {
      socket.leave(`community:${payload.communityId}`);
    });

    socket.on("message", async (payload: { communityId: string; body: string }) => {
      if (!userId) return;
      const body = String(payload.body ?? "").trim();
      if (!body) return;

      const inserted = await query<{ id: string; created_at: string }>(
        "insert into public.chat_messages (community_id, author_id, body) values ($1, $2, $3) returning id, created_at",
        [payload.communityId, userId, body],
      );

      const author = await query<{ nickname: string }>("select nickname from public.users where id = $1", [
        userId,
      ]);

      io.to(`community:${payload.communityId}`).emit("message", {
        id: inserted.rows[0]!.id,
        body,
        created_at: inserted.rows[0]!.created_at,
        author: { id: userId, nickname: author.rows[0]?.nickname ?? "anon" },
        communityId: payload.communityId,
      });
    });
  });

  return io;
}

