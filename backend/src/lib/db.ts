import pg from 'pg';
import { DatabaseSync } from 'node:sqlite'; // built into Node 22.5+ / 24 - no native compile needed
import path from 'path';
import crypto from 'crypto';

const { Pool } = pg;

export function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_m, c: string) => c.toUpperCase());
}

/** Converts a DB row's snake_case keys to camelCase for JSON responses. */
export function rowToCamel<T = any>(row: Record<string, any>): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    let val = v;
    if (v instanceof Date) {
      val = v.toISOString();
    } else if (typeof v === 'string' && (v.startsWith('[') || v.startsWith('{')) && (k === 'subjects' || k === 'options')) {
      try {
        val = JSON.parse(v.replace(/^{/, '[').replace(/}$/, ']'));
      } catch {
        val = v;
      }
    }
    out[snakeToCamel(k)] = val;
  }
  return out as T;
}

export function rowsToCamel<T = any>(rows: Record<string, any>[]): T[] {
  return rows.map((r) => rowToCamel<T>(r));
}

let pgPool: pg.Pool | null = null;
let pgFailed = false;
let sqliteDb: DatabaseSync | null = null;

function getSqlite(): DatabaseSync {
  if (!sqliteDb) {
    const dbFile = path.resolve(process.cwd(), 'oath_classes.db');
    sqliteDb = new DatabaseSync(dbFile);
    sqliteDb.exec('PRAGMA journal_mode = WAL');
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        father TEXT, mother TEXT, dob TEXT, gender TEXT,
        mobile TEXT NOT NULL, whatsapp TEXT, email TEXT,
        city TEXT, state TEXT, pin TEXT, school TEXT, prev_class TEXT,
        course TEXT, batch TEXT, mode TEXT,
        enrollment TEXT NOT NULL DEFAULT 'Pending',
        joined TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        student_name TEXT NOT NULL, guardian_name TEXT,
        phone TEXT NOT NULL, email TEXT, course TEXT NOT NULL,
        batch TEXT, school TEXT, address TEXT, message TEXT, mode TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
        mobile TEXT, qualification TEXT, experience TEXT, subject TEXT,
        course TEXT, batch TEXT, status TEXT NOT NULL DEFAULT 'Active'
      );
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT, fee INTEGER,
        duration TEXT, subjects TEXT NOT NULL DEFAULT '[]',
        students INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Active'
      );
      CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, number TEXT, course TEXT NOT NULL,
        teacher TEXT, schedule TEXT, mode TEXT, seats INTEGER NOT NULL DEFAULT 0,
        filled INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Upcoming'
      );
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, subject TEXT, chapter TEXT,
        topic TEXT, course TEXT, batch TEXT, file TEXT, published INTEGER NOT NULL DEFAULT 0,
        date TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS tests (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, course TEXT, batch TEXT,
        questions INTEGER, duration INTEGER, marks INTEGER, date TEXT, published INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY, text TEXT NOT NULL, subject TEXT, topic TEXT,
        difficulty TEXT, type TEXT NOT NULL DEFAULT 'MCQ', options TEXT NOT NULL DEFAULT '[]', answer TEXT
      );
      CREATE TABLE IF NOT EXISTS results (
        id TEXT PRIMARY KEY, student TEXT NOT NULL, test TEXT NOT NULL,
        marks INTEGER NOT NULL, total INTEGER NOT NULL, percentage REAL NOT NULL,
        remark TEXT, published INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS question_papers (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, course TEXT, batch TEXT,
        subject TEXT, exam_date TEXT, file TEXT, published INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS doubts (
        id TEXT PRIMARY KEY, student TEXT NOT NULL, subject TEXT, topic TEXT,
        question TEXT NOT NULL, attachment TEXT, status TEXT NOT NULL DEFAULT 'Pending',
        answer TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), answered_at TEXT
      );
      CREATE TABLE IF NOT EXISTS qna (
        id TEXT PRIMARY KEY, student TEXT, subject TEXT, question TEXT NOT NULL,
        date TEXT NOT NULL DEFAULT (datetime('now')), answer TEXT, status TEXT NOT NULL DEFAULT 'Pending'
      );
      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL,
        course TEXT, batch TEXT, date TEXT NOT NULL DEFAULT (datetime('now')), published INTEGER NOT NULL DEFAULT 0
      );
    `);
    try { sqliteDb.exec("ALTER TABLE doubts ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'))"); } catch {}
    try { sqliteDb.exec("ALTER TABLE doubts ADD COLUMN answered_at TEXT"); } catch {}
  }
  return sqliteDb;
}

function getPgPool(): pg.Pool {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 25000, // Neon wake hone ka wait
      idleTimeoutMillis: 30000,
      max: 5,
    });
    pgPool.on('error', (e) => console.warn('pg pool error:', e.message));
  }
  return pgPool;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Sirf connection wale errors retry hote hain, SQL errors seedha throw
function isConnectionError(err: any): boolean {
  const code = typeof err?.code === 'string' ? err.code : '';
  if (/^[0-9A-Z]{5}$/.test(code)) {
    return code.startsWith('08') || code.startsWith('57');
  }
  return true;
}

export const pool = {
  async query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount?: number | null }> {
    // DATABASE_URL hai to hamesha Postgres (Neon). SQLite me kabhi nahi jaana.
    if (process.env.DATABASE_URL && !pgFailed) {
      const MAX_ATTEMPTS = 3;
      let lastErr: any;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          return await getPgPool().query(text, params);
        } catch (err: any) {
          if (!isConnectionError(err)) throw err;
          lastErr = err;
          console.warn(`Neon not ready (attempt ${attempt}/${MAX_ATTEMPTS}): ${err.message}`);
          if (pgPool) {
            pgPool.end().catch(() => {});
            pgPool = null;
          }
          if (attempt < MAX_ATTEMPTS) await sleep(3000);
        }
      }
      throw new Error('Database is waking up, please try again in a few seconds. (' + (lastErr?.message || 'unknown') + ')');
    }
    // SQLite Fallback query execution
    const db = getSqlite();
    let sql = text.trim();

    // 1. Convert PostgreSQL ARRAY[...] syntax to JSON strings
    sql = sql.replace(/ARRAY\[([^\]]+)\]/gi, (_m, content) => {
      const items = content.split(',').map((s: string) => s.trim().replace(/^['"]|['"]$/g, ''));
      return `'${JSON.stringify(items)}'`;
    });

    // 2. Convert ON CONFLICT (col) DO NOTHING -> INSERT OR IGNORE
    if (/ON CONFLICT/i.test(sql) && /DO NOTHING/i.test(sql)) {
      sql = sql.replace(/^INSERT INTO/i, 'INSERT OR IGNORE INTO').replace(/ON CONFLICT\s*\([^)]+\)\s*DO NOTHING/gi, '');
    }

    // 3. Handle boolean comparisons
    sql = sql.replace(/published\s*=\s*true/gi, 'published = 1')
             .replace(/published\s*=\s*false/gi, 'published = 0')
             .replace(/::int/gi, '')
             .replace(/NULLS LAST/gi, '');

    // 4. Handle ANY($1::text[]) for doubt IDs search
    if (sql.includes('ANY($1::text[])')) {
      const ids: string[] = params[0] || [];
      if (!ids.length) return { rows: [], rowCount: 0 };
      const placeholders = ids.map(() => '?').join(',');
      const fullSql = sql.replace('id = ANY($1::text[])', `id IN (${placeholders})`);
      const stmt = db.prepare(fullSql);
      const rows = stmt.all(...ids).map((r: any) => ({
        ...r,
        published: r.published !== undefined ? Boolean(r.published) : undefined,
        created_at: r.created_at ? new Date(r.created_at) : new Date(),
        answered_at: r.answered_at ? new Date(r.answered_at) : null,
      }));
      return { rows, rowCount: rows.length };
    }

    const sqliteParams = params.map((p) => {
      if (Array.isArray(p)) return JSON.stringify(p);
      if (typeof p === 'boolean') return p ? 1 : 0;
      return p;
    });

    const isSelect = /^SELECT/i.test(sql);
    const isInsert = /^INSERT/i.test(sql);
    const isUpdate = /^UPDATE/i.test(sql);
    const isDelete = /^DELETE/i.test(sql);

    // Normalize placeholders ($1, $2...) -> (?)
    let sqliteSql = sql.replace(/\$\d+/g, '?').replace(/RETURNING\s+[\*\w\s,]+/gi, '');

    if (isSelect) {
      const stmt = db.prepare(sqliteSql);
      const rawRows = stmt.all(...sqliteParams);
      const rows = rawRows.map((r: any) => {
        const row = { ...r };
        if (row.published !== undefined) row.published = Boolean(row.published);
        if (row.created_at) row.created_at = new Date(row.created_at);
        if (row.answered_at) row.answered_at = new Date(row.answered_at);
        if (row.date && typeof row.date === 'string' && !isNaN(Date.parse(row.date))) {
          row.date = new Date(row.date);
        }
        return row;
      });
      return { rows, rowCount: rows.length };
    }

    if (isInsert) {
      const tableMatch = sql.match(/INSERT(?:\s+OR\s+\w+)?\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\((.+)\)/i);
      let newGeneratedId: string | null = null;
      if (tableMatch) {
        const tableName = tableMatch[1];
        const colsStr = tableMatch[2];
        const valsStr = tableMatch[3];
        const cols = colsStr.split(',').map((c) => c.trim().toLowerCase());
        const idIdx = cols.indexOf('id');
        if (idIdx === -1) {
          newGeneratedId = crypto.randomUUID();
          sqliteSql = `INSERT OR IGNORE INTO ${tableName} (id, ${colsStr}) VALUES ('${newGeneratedId}', ${valsStr.replace(/\$\d+/g, '?')})`;
        } else if (typeof sqliteParams[idIdx] === 'string') {
          // caller supplied its own id -> still read the row back so RETURNING * works
          newGeneratedId = sqliteParams[idIdx] as string;
        }
      }

      const stmt = db.prepare(sqliteSql);
      const info = stmt.run(...sqliteParams);

      let rows: any[] = [];
      if (newGeneratedId && tableMatch) {
        const tableName = tableMatch[1];
        const sel = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(newGeneratedId) as any;
        if (sel) {
          if (sel.published !== undefined) sel.published = Boolean(sel.published);
          if (sel.created_at) sel.created_at = new Date(sel.created_at);
          if (sel.answered_at) sel.answered_at = new Date(sel.answered_at);
          rows = [sel];
        }
      }
      return { rows, rowCount: Number(info.changes) };
    }

    if (isUpdate) {
      const stmt = db.prepare(sqliteSql);
      const info = stmt.run(...sqliteParams);
      const idParam = params[params.length - 1];
      const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
      let rows: any[] = [];
      if (tableMatch && idParam) {
        const tableName = tableMatch[1];
        const sel = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(idParam) as any;
        if (sel) {
          if (sel.published !== undefined) sel.published = Boolean(sel.published);
          if (sel.created_at) sel.created_at = new Date(sel.created_at);
          if (sel.answered_at) sel.answered_at = new Date(sel.answered_at);
          rows = [sel];
        }
      }
      return { rows, rowCount: Number(info.changes) };
    }

    if (isDelete) {
      const stmt = db.prepare(sqliteSql);
      const info = stmt.run(...sqliteParams);
      return { rows: [], rowCount: Number(info.changes) };
    }

    const stmt = db.prepare(sqliteSql);
    const info = stmt.run(...sqliteParams);
    return { rows: [], rowCount: Number(info.changes) };
  },

  async end(): Promise<void> {
    if (pgPool) {
      await pgPool.end();
      pgPool = null;
    }
  },
};
