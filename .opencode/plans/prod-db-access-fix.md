# Plan: Fix Production Register 500 (Postgres Access Denied)

## Problem

`POST /api/auth/register` on production (`http://147.93.107.249:3039`) fails with:

```
PrismaClientInitializationError: User was denied access on the database
```

App code path is fine (`src/app/api/auth/register/route.ts` → `prisma.user.findUnique`). Failure is **Postgres auth at network/HBA layer**, not application logic.

## Root Cause

| Piece | Value |
|-------|--------|
| App server (prod) | `147.93.107.249` |
| Postgres host | `194.233.93.234:6530` |
| DB name (prod) | `lucky_draw_production` |
| User | `baronhcisdocportal` |

`pg_hba.conf` on `194.233.93.234` currently allows LuckyDraw / app access for:

- `lucky_draw_staging` from Docker nets + `112.78.144.148` + **`185.227.135.32`** (staging app)
- generic `all` for `baronhcisdocportal` from `112.78.144.148` and `185.227.135.32`

**Missing:**

1. Host rule for client IP **`147.93.107.249/32`** (production app server)
2. Explicit database **`lucky_draw_production`** (only `lucky_draw_staging` is named for LuckyDraw)

Error message “denied access on the database” matches Prisma/Postgres when HBA rejects or role lacks CONNECT on that DB.

Jenkinsfile already points prod at:

```
postgresql://...@194.233.93.234:6530/lucky_draw_production?schema=public
```

So pipeline URL is correct; **DB server policy is not**.

## Scope (ops only — per request)

No app code, Dockerfile, or Jenkinsfile changes in this plan. Only Postgres server + verify connectivity.

---

## Execution Steps

### 1. Confirm DB exists and role can connect (on Postgres host)

SSH: `ssh -p 2232 <user>@194.233.93.234` (adjust user if not root)

```bash
sudo -u postgres psql -c "\l lucky_draw_production"
sudo -u postgres psql -c "\du baronhcisdocportal"
sudo -u postgres psql -d lucky_draw_production -c "SELECT 1;"
```

If DB missing:

```sql
CREATE DATABASE lucky_draw_production OWNER baronhcisdocportal;
GRANT ALL PRIVILEGES ON DATABASE lucky_draw_production TO baronhcisdocportal;
-- after schema exists / migrations:
\c lucky_draw_production
GRANT ALL ON SCHEMA public TO baronhcisdocportal;
GRANT ALL ON ALL TABLES IN SCHEMA public TO baronhcisdocportal;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO baronhcisdocportal;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO baronhcisdocportal;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO baronhcisdocportal;
```

### 2. Patch `pg_hba.conf`

File: `/etc/postgresql/16/main/pg_hba.conf`

Add (near existing lucky_draw / app server rules):

```conf
# Allow LuckyDraw production app server
host    lucky_draw_production    baronhcisdocportal    147.93.107.249/32    scram-sha-256
host    all                      baronhcisdocportal    147.93.107.249/32    scram-sha-256
```

Optional tighten later: drop the broad `host all baronhcisdocportal ...` and keep only named DBs.

### 3. Reload Postgres (no full restart needed for HBA)

```bash
sudo systemctl reload postgresql
# or:
sudo -u postgres psql -c "SELECT pg_reload_conf();"
```

Verify HBA loaded:

```bash
sudo -u postgres psql -c "SHOW hba_file;"
# tail last lines of pg_hba.conf to confirm new rules present
```

### 4. Test from production app server

SSH: `ssh -p 6531 root@147.93.107.249`

```bash
# From host (if psql available)
psql "postgresql://baronhcisdocportal:<password>@194.233.93.234:6530/lucky_draw_production?sslmode=prefer" -c "SELECT current_database(), current_user;"

# Or from running container
docker exec -it luckydraw-production sh -c 'echo $DATABASE_URL'   # confirm DB name = lucky_draw_production
# if node/psql available inside, probe; else curl register after step 5
```

Expect: connect success, not “no pg_hba.conf entry” / “permission denied for database”.

### 5. Schema / migrations (if DB new or empty)

From app server app dir (`/var/www/luckydraw-production`) or any machine with correct `DATABASE_URL`:

```bash
export DATABASE_URL='postgresql://baronhcisdocportal:<password>@194.233.93.234:6530/lucky_draw_production?schema=public'
npx prisma migrate deploy
# optional seed admin if needed:
# npx prisma db seed
```

(Do this once DB CONNECT works; register needs `User` table.)

### 6. Verify register endpoint

```bash
curl -sS -X POST http://147.93.107.249:3039/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"mwhimam hsm","email":"mwhimam.hsm@gmail.com","password":"Password123@","role":"ADMIN"}'
```

Expect: `201` with user payload, or `400` “Email sudah terdaftar” if already created — **not** `500` / Prisma init error.

Check logs:

```bash
docker logs luckydraw-production --tail 50
```

---

## Success Criteria

- [ ] `lucky_draw_production` exists; role has CONNECT + schema rights
- [ ] `pg_hba.conf` allows `147.93.107.249` → `lucky_draw_production` as `baronhcisdocportal`
- [ ] Postgres reloaded
- [ ] TCP auth from prod app server succeeds
- [ ] Migrations applied if needed
- [ ] Register returns non-500

---

## Rollback

Remove the two new `pg_hba` lines and `reload postgresql` again. Staging (`185.227.135.32` / `lucky_draw_staging`) unchanged.

---

## Out of Scope (later if needed)

- Move DB passwords out of Jenkinsfile into Jenkins credentials
- Dockerfile: ensure generated Prisma client present in standalone image
- Jenkins remote heredoc variable expansion quirks
- Public open register → ADMIN role (security product decision)

---

## Why error said database `147.93.107.249`

Prisma often surfaces **client/host context** poorly in init errors; app host is `147.93.107.249` while real DB host is `194.233.93.234`. Treat as “access denied for this app’s DB connection”, not “DB named 147…”.
