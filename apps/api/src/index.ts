console.log("👉 ЭЙ! Клешни прочь, я начал выполняться!"); // <--- НА САМУЮ ПЕРВУЮ СТРОЧКУ

import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http"; // Добавили стандартный HTTP-сервер
import { Server } from "socket.io"; // Добавили Socket.IO
import { env } from "./env.js";
import { api } from "./routes.js";

const app = express();
const server = createServer(app); // Оборачиваем Express в HTTP-сервер

const allowedOrigins = new Set(
  [env.WEB_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"].filter(Boolean),
);

// 🔌 Инициализируем Socket.IO и настраиваем CORS для фронтенда
const io = new Server(server, {
  cors: {
    origin: Array.from(allowedOrigins),
    credentials: true,
  },
});

// 🧠 Связываем сокеты с Express, чтобы их видел файл routes.ts
app.set("io", io);

app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin / server-to-server / curl (no Origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Все роуты из routes.ts будут иметь префикс /api
app.use("/api", api);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : "Server error";
  // eslint-disable-next-line no-console
  console.error("💥 Ошибка на сервере:", err);
  res.status(500).json({ error: message });
});

// Сокет-соединение: логируем, когда кто-то подключается к сайту
io.on("connection", (socket) => {
  console.log(`🟢 Юзер подключился по сокетам: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`🔴 Юзер отключился от сокетов: ${socket.id}`);
  });
});

// Запускаем именно HTTP-сервер (server.listen вместо app.listen)
server.listen(env.PORT, () => {
  console.log(`\n🚀 ==========================================`);
  console.log(`📡 Бэкенд TORtick успешно запущен!`);
  console.log(`🔗 API доступно на: http://localhost:${env.PORT}/api`);
  console.log(`🩺 Проверка здоровья: http://localhost:${env.PORT}/api/health`);
  console.log(`==========================================\n`);
});
