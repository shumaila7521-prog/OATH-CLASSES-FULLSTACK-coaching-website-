OATH CLASSES — FULL STACK (Frontend + Admin Panel + Backend)

This folder has three independent projects that now talk to each other
over one backend API:

- frontend/     = Student/Public Website (Enroll Now -> real registration)
- admin-panel/  = Admin Panel (students, registrations, teachers, courses...)
- backend/      = Node.js + Express + PostgreSQL API used by both

--------------------------------------------
1) SET UP THE DATABASE (one-time)
--------------------------------------------
You need a PostgreSQL server running locally (or update DATABASE_URL to
point at a hosted one - Supabase, Neon, Railway, RDS, etc.).

  createdb oath_classes

--------------------------------------------
2) RUN THE BACKEND
--------------------------------------------
  cd backend
  cp .env.example .env        # edit DATABASE_URL / JWT_SECRET if needed
  npm install
  npm run migrate             # creates all tables (prisma/schema.sql)
  npm run seed                # creates admin + teacher login, sample data
  npm run dev                 # starts on http://localhost:5000

Default seeded logins (change these in production):
  Admin:   admin@oathclasses.in   / admin123
  Teacher: teacher@oathclasses.in / teacher123

--------------------------------------------
3) RUN THE FRONTEND (public site)
--------------------------------------------
  cd frontend
  npm install
  npm run dev -- --port 5173
  Open: http://localhost:5173

Enroll Now submissions now POST to the backend
(frontend/.env -> VITE_API_BASE_URL=http://localhost:5000/api) and will
show up live in the Admin Panel's Registrations list. If the backend is
unreachable, the form still works locally as a fallback.

--------------------------------------------
4) RUN THE ADMIN PANEL
--------------------------------------------
  cd admin-panel
  npm install
  npm run dev -- --port 5174
  Open: http://localhost:5174

admin-panel/.env already has VITE_USE_MOCK=false, so it talks to the real
backend instead of mock data. Log in with the admin credentials above.

--------------------------------------------
NOTES
--------------------------------------------
- No original UI/behavior was changed in either frontend beyond wiring
  the registration flow to the backend - layout, styling, components are
  untouched.
- The backend is plain Node + Express + `pg` (no ORM binary downloads
  required), so it runs anywhere Node + Postgres run.
- All admin-panel endpoints (students, teachers, courses, batches, notes,
  tests, question bank, results, question papers, doubts, Q&A,
  announcements) are implemented and backed by real Postgres tables -
  currently only Courses, Teachers and Batches are seeded with sample
  data; add the rest from the Admin Panel UI.
- For production: deploy the backend somewhere with Postgres (Railway,
  Render, Fly.io, etc.), then point both frontends' VITE_API_BASE_URL at
  that deployed URL and rebuild (npm run build).
