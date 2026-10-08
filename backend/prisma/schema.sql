-- OATH Classes backend schema (PostgreSQL)
-- Run with: psql "$DATABASE_URL" -f prisma/schema.sql
-- (kept under prisma/ for familiarity; no Prisma runtime is used)

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

CREATE TABLE IF NOT EXISTS admin_users (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'teacher')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name       TEXT NOT NULL,
  father     TEXT,
  mother     TEXT,
  dob        TEXT,
  gender     TEXT,
  mobile     TEXT NOT NULL,
  whatsapp   TEXT,
  email      TEXT,
  city       TEXT,
  state      TEXT,
  pin        TEXT,
  school     TEXT,
  prev_class TEXT,
  course     TEXT,
  batch      TEXT,
  mode       TEXT,
  enrollment TEXT NOT NULL DEFAULT 'Pending',
  joined     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One canonical registration row serves both existing frontends, which
-- expect different field names (see routes/registrations.ts serialize()).
CREATE TABLE IF NOT EXISTS registrations (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_name  TEXT NOT NULL,
  guardian_name TEXT,
  phone         TEXT NOT NULL,
  email         TEXT,
  course        TEXT NOT NULL,
  batch         TEXT,
  school        TEXT,
  address       TEXT,
  message       TEXT,
  mode          TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teachers (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  mobile        TEXT,
  qualification TEXT,
  experience    TEXT,
  subject       TEXT,
  course        TEXT,
  batch         TEXT,
  status        TEXT NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS courses (
  id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name     TEXT NOT NULL,
  code     TEXT,
  fee      INTEGER,
  duration TEXT,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  students INTEGER NOT NULL DEFAULT 0,
  status   TEXT NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS batches (
  id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name     TEXT NOT NULL,
  number   TEXT,
  course   TEXT NOT NULL,
  teacher  TEXT,
  schedule TEXT,
  mode     TEXT,
  seats    INTEGER NOT NULL DEFAULT 0,
  filled   INTEGER NOT NULL DEFAULT 0,
  status   TEXT NOT NULL DEFAULT 'Upcoming'
);

CREATE TABLE IF NOT EXISTS notes (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title     TEXT NOT NULL,
  subject   TEXT,
  chapter   TEXT,
  topic     TEXT,
  course    TEXT,
  batch     TEXT,
  file      TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  date      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tests (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title     TEXT NOT NULL,
  course    TEXT,
  batch     TEXT,
  questions INTEGER,
  duration  INTEGER,
  marks     INTEGER,
  date      TEXT,
  published BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS questions (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  text       TEXT NOT NULL,
  subject    TEXT,
  topic      TEXT,
  difficulty TEXT,
  type       TEXT NOT NULL DEFAULT 'MCQ',
  options    TEXT[] NOT NULL DEFAULT '{}',
  answer     TEXT
);

CREATE TABLE IF NOT EXISTS results (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student    TEXT NOT NULL,
  test       TEXT NOT NULL,
  marks      INTEGER NOT NULL,
  total      INTEGER NOT NULL,
  percentage REAL NOT NULL,
  remark     TEXT,
  published  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS question_papers (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title     TEXT NOT NULL,
  course    TEXT,
  batch     TEXT,
  subject   TEXT,
  exam_date TEXT,
  file      TEXT,
  published BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS doubts (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student    TEXT NOT NULL,
  subject    TEXT,
  topic      TEXT,
  question   TEXT NOT NULL,
  attachment TEXT,
  status     TEXT NOT NULL DEFAULT 'Pending',
  answer     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS qna (
  id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student  TEXT,
  subject  TEXT,
  question TEXT NOT NULL,
  date     TIMESTAMPTZ NOT NULL DEFAULT now(),
  answer   TEXT,
  status   TEXT NOT NULL DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS announcements (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title     TEXT NOT NULL,
  body      TEXT NOT NULL,
  course    TEXT,
  batch     TEXT,
  date      TIMESTAMPTZ NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT false
);

-- Upgrade path for databases created before the public student routes existed
-- (safe to re-run; does nothing if the columns are already there).
ALTER TABLE doubts ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE doubts ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ;
