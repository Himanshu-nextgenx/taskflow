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


# Environment Variables

Create a `.env` file in the project root and configure the following variables:
```env

PORT=3000

DATABASE_URL="postgresql://postgres:YOUR_DB_PASSWORD@postgres:5432/taskflow"

REDIS_HOST=redis
REDIS_PORT=6379

ACCESS_TOKEN_SECRET="your-random-access-secret"
REFRESH_TOKEN_SECRET="your-random-refresh-secret"

# Gmail OAuth2
CLIENT_ID="your-google-client-id"
CLIENT_SECRET="your-google-client-secret"
REFRESH_TOKEN="your-google-oauth-refresh-token"
EMAIL_USER="your-gmail-address"


## Test Login (from seed data)

| Email | Password | Role | Org |
|---|---|---|---|
| raj@infosys.com | Password123 | org_admin | Infosys |
| simran@infosys.com | Password123 | member | Infosys |
| priya@tcs.com | Password123 | org_admin | TCS |
| karan@tcs.com | Password123 | member | TCS |

##  Folder Structure

```text
taskflow/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   │
│   ├── config/
│   │   ├── nodemailer.ts
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── swagger.ts
│   │
│   ├── jobs/
│   │   ├── controller/
│   │   │   └── job.controller.ts
│   │   │
│   │   ├── queues/
│   │   │   └── email.queue.ts
│   │   │
│   │   ├── routes/
│   │   │   └── job.route.ts
│   │   │
│   │   └── workers/
│   │       └── email.worker.ts
│   │
│   ├── middlewares/
│   │   ├── admin.middleware.ts
│   │   ├── auth.middleware.ts
│   │   └── ratelimiter.ts
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── controller/
│   │   │   │   └── auth.controller.ts
│   │   │   ├── routes/
│   │   │   │   └── auth.route.ts
│   │   │   └── service/
│   │   │       └── auth.service.ts
│   │   │
│   │   ├── comments/
│   │   │   ├── controller/
│   │   │   ├── routes/
│   │   │   └── service/
│   │   │
│   │   ├── organizations/
│   │   │   ├── controller/
│   │   │   ├── routes/
│   │   │   └── service/
│   │   │
│   │   ├── projects/
│   │   │   ├── controller/
│   │   │   ├── routes/
│   │   │   └── service/
│   │   │
│   │   └── tasks/
│   │       ├── controller/
│   │       ├── routes/
│   │       └── service/
│   │
│   ├── types/
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── appError.ts
│   │   └── tokens.ts
│   │
│   ├── validations/
│   │   ├── auth.validator.ts
│   │   ├── project.validator.ts
│   │   └── task.validator.ts
│   │
│   └── app.ts
│
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── server.ts
├── Architecture.md
├── taskflow.postman_collection.json
├── tsconfig.json
└── README.md

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

