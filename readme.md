# TaskFlow — Backend API

Multi-tenant project management backend. Users register, get their own 
organization, create projects, add tasks, assign work to teammates, and 
get email notifications (background job) when assigned.

## Tech Stack

- Node.js + Express + TypeScript
- PostgreSQL (via Prisma ORM)
- Redis + BullMQ (background jobs)
- Docker Compose
- Zod (validation), JWT + bcrypt (auth)

## How to Run

### With Docker (recommended)
```bash
docker compose up --build
```
This starts Postgres, Redis, the API server, and the background worker together. 
Migrations + seed data run automatically.

API runs on: `http://localhost:3000`

### Without Docker
```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev       # starts API
npm run worker    # starts background worker (separate terminal)
```

## Environment Variables (`.env`)



DATABASE_URL=postgresql://postgres:<password>@postgres:5432/taskflow?schema=public
ACCESS_TOKEN_SECRET=your_secret_here
REFRESH_TOKEN_SECRET=your_secret_here
REDIS_HOST=redis
REDIS_PORT=6379
PORT=3000


## Test Login (from seed data)

| Email | Password | Role | Org |
|---|---|---|---|
| raj@infosys.com | Password123 | org_admin | Infosys |
| simran@infosys.com | Password123 | member | Infosys |
| priya@tcs.com | Password123 | org_admin | TCS |
| karan@tcs.com | Password123 | member | TCS |

## Folder Structure
prisma/
schema.prisma → DB schema
seed.ts → seed data script
src/
config/ → Prisma client setup (with pg adapter)
jobs/
controller/ → job status controller
queues/ → BullMQ queue definitions
routes/ → GET /jobs/:id route
workers/ → email worker (processes background jobs)
middlewares/
auth.middleware.ts → verifies JWT, sets req.user
admin.middleware.ts → checks role === org_admin
ratelimiter.ts → rate limits auth routes
modules/
auth/ → register, login, refresh, logout
organization/ → add member endpoint
projects/ → project CRUD + dashboard
tasks/ → task CRUD, filters, assign/unassign
comments/ → task comments
types/ → shared TS types (UserPayload, DTOs)
utils/
tokens.ts → JWT generate/verify helpers
appError.ts → custom error class
validations/ → Zod schemas
app.ts → Express app + route registration
server.ts → app entry point (starts HTTP server)
worker.ts → worker entry point (separate process)

docker-compose.yml
dockerfile

## API Endpoints

see full docs on **/api-docs**

Full request/response examples are in the Postman collection 
(`taskflow.postman_collection.json`).

**Auth:** `/api/register`, `/api/login`, `/api/refresh`, `/api/logout`
**Organizations:** `POST /api/organizations/members` (admin only)
**Projects:** `POST|GET /api/projects`, `GET|PUT|DELETE /api/projects/:id`, 
`GET /api/projects/:id/dashboard`
**Tasks:** `POST|GET /api/tasks`, `GET|PUT|DELETE /api/tasks/:id`, 
`POST /api/tasks/:id/assign`, `POST /api/tasks/:id/unassign`
**Comments:** `POST|GET /api/tasks/:taskId/comments`
**Jobs:** `GET /api/jobs/:id`



## Key Decisions

1. **Organization on register:** When a user registers, a new organization 
   is created automatically and the user becomes its `org_admin` (single DB 
   transaction — user + org + membership created together). This was not 
   specified in the assignment, so a sensible default was chosen.

2. **Adding members:** An `org_admin` can create new user accounts directly 
   as members (or admins) of their org via `POST /organizations/members`.

3. **Organization context in JWT:** The access token carries `organizationId` 
   and `role`, set only by the server at login/register — never trusted 
   from client input. All queries in the service layer filter by this value.

4. **403 vs 404:** If a resource doesn't exist at all → 404. If it exists 
   but belongs to another organization → 403. This avoids leaking whether 
   another org's resource exists.

5. **Refresh tokens:** Stored in the DB as bcrypt hashes, delivered as 
   `httpOnly` cookies, and rotated on every refresh (old one revoked, new 
   one issued).

6. **Background jobs:** Assigning a task queues an email job (BullMQ) 
   instead of sending synchronously — API responds fast, a separate worker 
   process sends the (mocked) email with 3 retries (1s → 2s → 4s backoff).

## What's Not Done 

 # Testing

The APIs were manually tested during development using Postman.
Automated test cases are not included in this submission.

