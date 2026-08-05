# HireTrail

**Production-ready job application CRM** — track applications, interviews, companies, contacts, follow-ups, and conversion analytics.

| Layer | Stack |
| --- | --- |
| Frontend | **Angular 19** (standalone) + **Tailwind CSS** |
| Backend | **NestJS 11** REST API, JWT auth, validation |
| Database | **Neon Postgres** in production · SQL.js local (Neon in production)ly |
| ORM | TypeORM |

Repository: [github.com/Criscode2022/hiretrail](https://github.com/Criscode2022/hiretrail)

---

## Features

- **Auth** — register / login with JWT (Bearer + httpOnly cookie)
- **Applications** — full CRUD, salary bands, remote flag, sources, follow-up dates
- **Pipeline board** — kanban by status with one-click advance/back
- **Interviews** — schedule rounds, outcomes, prep notes
- **Companies & contacts** — lightweight CRM for hiring teams
- **Notes** — timeline notes per application
- **Dashboard** — funnel conversion, stale apps, upcoming interviews, avg target salary
- **Demo seed** — boots with sample data on first run

### Demo credentials

```
email:    demo@hiretrail.app
password: demo1234
```

---

## Quick start

### Prerequisites

- Node.js 20+
- Optional: Neon project for production Postgres

```bash
git clone https://github.com/Criscode2022/hiretrail.git
cd hiretrail
npm install
npm run build
npm start
```

Open **http://localhost:8080**

### Development

```bash
# Terminal 1 — API (also serves built SPA when present)
npm run dev --workspace=apps/api

# Terminal 2 — Angular live reload (proxy /api → :8080)
npm run start --workspace=apps/web -- --port 4200 --proxy-config proxy.conf.json
```

### Environment

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon / Postgres connection string. **If unset**, SQL.js file is used. |
| `JWT_SECRET` | Signing secret for access tokens (required in production) |
| `PORT` | Default `8080` |
| `HOST` | Default `0.0.0.0` |
| `SQLITE_PATH` | Local DB path when `DATABASE_URL` is unset |
| `SEED_ON_START` | Set `false` to skip auto-seed |
| `CORS_ORIGIN` | Optional CORS origin restriction |

**Neon setup**

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the pooled connection string
3. Export it:

```bash
export DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
export JWT_SECRET="a-long-random-secret"
npm run build && npm start
```

TypeORM `synchronize` creates tables on boot (suitable for this app; use migrations for larger teams).

---

## Docker

```bash
docker compose up --build
# or
docker build -t hiretrail .
docker run -p 8080:8080 -e JWT_SECRET=secret -e DATABASE_URL="$DATABASE_URL" hiretrail
```

---

## API overview

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | no | Health + DB mode |
| POST | `/api/auth/register` | no | Create account |
| POST | `/api/auth/login` | no | Login |
| POST | `/api/auth/logout` | no | Clear cookie |
| GET | `/api/users/me` | yes | Current user |
| GET | `/api/dashboard` | yes | Analytics + pipeline |
| CRUD | `/api/applications` | yes | Applications |
| CRUD | `/api/companies` | yes | Companies |
| CRUD | `/api/contacts` | yes | Contacts |
| CRUD | `/api/interviews` | yes | Interviews |
| CRUD | `/api/notes` | yes | Notes |

All per-user queries are scoped by the JWT subject — never trust a client-sent user id.

---

## Project structure

```
apps/
  api/   NestJS API + TypeORM entities + seed
  web/   Angular 19 SPA + Tailwind
Dockerfile
docker-compose.yml
startup.sh
```

---

## Scripts

| Command | Action |
| --- | --- |
| `npm run build` | Build web + api |
| `npm start` | Run production API (serves SPA) |
| `npm run dev` | API watch mode |
| `npm test` | API unit tests |

---

## License

MIT © Cristian Damil García ([Criscode2022](https://github.com/Criscode2022))
