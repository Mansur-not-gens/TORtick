import type { Request, Response, NextFunction } from "express";
import { query } from "./db.js";

function generateNickname() {
  const suffix = Math.random().toString(16).slice(2, 6);
  return `anon-${suffix}`;
}

export async function ensureAnonSession(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.session.userId) return next();

    const nickname = generateNickname();
    const created = await query<{ id: string }>(
      "insert into public.users (nickname) values ($1) returning id",
      [nickname],
    );

    req.session.userId = created.rows[0]?.id;
    return next();
  } catch (err) {
    return next(err);
  }
}

