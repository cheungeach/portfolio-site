import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// One SQLite file, created on first run. Swap this module for Supabase/Postgres later — every query lives in lib/*.ts.
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "pathfinder.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

declare global {
  // eslint-disable-next-line no-var
  var __pfdb: Database.Database | undefined;
}

export const db: Database.Database = global.__pfdb ?? new Database(dbPath);
if (!global.__pfdb) {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  global.__pfdb = db;
}

function migrate(d: Database.Database) {
  d.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    onboarded INTEGER NOT NULL DEFAULT 0,
    quota INTEGER NOT NULL DEFAULT 20,
    report_day TEXT NOT NULL DEFAULT 'Monday',
    report_channel TEXT NOT NULL DEFAULT 'email',
    school_pack TEXT NOT NULL DEFAULT 'berkeley',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS directions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hint TEXT NOT NULL DEFAULT '',
    rank INTEGER NOT NULL,
    resume_id INTEGER
  );
  CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    direction_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL DEFAULT '',
    deadline TEXT NOT NULL,
    description TEXT NOT NULL,
    direction_hint TEXT NOT NULL DEFAULT '',
    big_title INTEGER NOT NULL DEFAULT 0,
    easy_get INTEGER NOT NULL DEFAULT 0,
    base_score INTEGER NOT NULL DEFAULT 70
  );
  CREATE TABLE IF NOT EXISTS report_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    week TEXT NOT NULL,
    score INTEGER NOT NULL,
    reasons TEXT NOT NULL,
    rationale TEXT NOT NULL,
    story_ids TEXT NOT NULL DEFAULT '[]',
    mode TEXT,
    UNIQUE(user_id, job_id, week)
  );
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    mode TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'drafting',
    paragraphs TEXT NOT NULL DEFAULT '[]',
    strategy TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, job_id)
  );
  `);
}
