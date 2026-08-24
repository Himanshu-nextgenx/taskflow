# TaskFlow — Architecture

## What it is

A REST API where each request goes: **Route → Middleware → Controller → 
Service → Database**. Every piece of business logic lives in the Service 
layer; Controllers only handle HTTP request/response.

## Components

Client (Postman)
│
▼
Express API Server ──────────► PostgreSQL (via Prisma)
│
│ (on task assign, enqueue a job)
▼
Redis (BullMQ queue)
│
▼
Worker Process (separate) ──► sends email (mocked)


Two separate Node processes run:
1. **API server** (`server.ts`) — handles HTTP requests
2. **Worker** (`worker.ts`) — picks up background jobs from Redis and 
   processes them (currently: sending assignment emails)

They both talk to the same PostgreSQL database and Redis instance, so they 
can run as separate Docker containers (see `docker-compose.yml`).

## Request Flow — Example: Assign a Task

1. Client sends `POST /api/tasks/:id/assign` with `Authorization: Bearer <token>`.
2. **`auth.middleware.ts`** verifies the JWT, reads `{ userId, organizationId, role }` 
   from it, attaches to `req.user`.
3. **Controller** (`task.controller.ts`) reads the task ID from the URL and 
   the target user's ID from the body, calls the Service.
4. **Service** (`task.service.ts`):
   - Checks the task exists and belongs to `req.user.organizationId` (via 
     the task's project).
   - Checks the user being assigned also belongs to that same organization.
   - Creates the `TaskAssignment` row in Postgres.
   - Adds a job to the BullMQ email queue and returns immediately (does 
     not wait for the email to actually send).
5. **Worker** picks up the queued job separately, "sends" the email (mocked 
   with a console log), retries up to 3 times on failure with increasing 
   delays.
6. Client can check job progress anytime via `GET /api/jobs/:id`.

## Multi-Tenancy (how organizations stay isolated)

- Every JWT (issued only by the server, at login/register) carries the 
  user's `organizationId`.
- Every database query for projects/tasks/comments filters by this 
  `organizationId` — either directly, or through the task's project 
  relation.
- A resource that doesn't exist → `404`. A resource that exists but 
  belongs to a different organization → `403`, without revealing any of 
  its data.

## Auth Flow

- **Access token** (JWT, 15 min): sent in `Authorization: Bearer` header, 
  contains user identity + org context.
- **Refresh token** (7 days): stored as an `httpOnly` cookie, its hash is 
  saved in the database. Every time it's used to get a new access token, 
  the old refresh token is revoked and a new one is issued (rotation) — so 
  a stolen refresh token only works once.
- `admin.middleware.ts` blocks non-admins from admin-only actions (like 
  deleting a project or creating org members).
- `ratelimiter.ts` limits auth routes to 10 requests/minute per IP.

## Background Jobs

- Queue and worker logic live in `src/jobs/`.
- `queues/` defines the BullMQ queue.
- `workers/email.worker.ts` is the actual job processor — runs as its own 
  process, separate from the API.
- This keeps the API fast: it never blocks a request waiting for an email 
  to send.