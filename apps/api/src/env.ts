import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
});

export const env = EnvSchema.parse({
  PORT: process.env.PORT,
  WEB_ORIGIN: process.env.WEB_ORIGIN,
  DATABASE_URL: process.env.DATABASE_URL,
});

