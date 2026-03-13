# Supabase DB connection & migrations

## What you need to provide

1. **`DATABASE_URL`** – Supabase connection string  
   - Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **Database**.  
   - Under **Connection string**, choose **URI** (or **Session pooler** for port 6543).  
   - Copy the URI and replace `[YOUR-PASSWORD]` with your **database password** (not your Supabase account password).

2. **`BETTER_AUTH_SECRET`** (for auth)  
   - Generate: `openssl rand -base64 32`  
   - Put the value in `.env` as `BETTER_AUTH_SECRET=...`

## Setup

1. Copy env example and fill in values:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and set DATABASE_URL and BETTER_AUTH_SECRET
   ```

2. Run migrations (creates all tables):

   **Step A – Auth tables** (user, session, account, verification):
   ```bash
   npm run migrate:auth
   ```

   **Step B – App tables** (projects, tasks) – first time only, generate migration files:
   ```bash
   npm run db:generate
   ```

   **Step C – Apply Drizzle migrations**:
   ```bash
   npm run db:migrate
   ```

   Or run both auth and Drizzle in one go (after you’ve run `db:generate` at least once):
   ```bash
   npm run migrate:auth && npm run db:migrate
   ```

3. Start the API:
   ```bash
   npm run dev
   ```

SSL is enabled automatically when `DATABASE_URL` contains `supabase.co` or `pooler.supabase.com`.
