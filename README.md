# TORtick (MVP)

Anonymous, privacy-first social network MVP (Reddit + Discord + Telegram vibes) built with:

- **Web**: Next.js (App Router) + React + TailwindCSS
- **API**: Node.js + Express + Socket.IO
- **DB**: PostgreSQL (Supabase)
- **Auth**: Anonymous session cookies (no email/phone)

## Quick start (local)

1) Create a Supabase project and grab:

- Postgres connection string (or host/user/password/db)
- A database password

2) Apply schema:

- Run the SQL in `db/schema.sql` in Supabase SQL editor.

3) Configure env files:

- `apps/api/.env` (copy from `.env.example`)
- `apps/web/.env` (copy from `.env.example`)

4) Install + run:

```bash
npm install
npm run dev
```

Web: `http://localhost:3000`  
API: `http://localhost:4000`

