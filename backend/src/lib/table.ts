import { pool, camelToSnake, rowToCamel, rowsToCamel } from './db';

/**
 * Wraps one Postgres table with generic list/get/create/update/delete
 * helpers, converting camelCase JS field names to snake_case columns and
 * back. Every table here has a single-column `id text primary key`.
 */
export function table<T = any>(name: string, defaultOrderBy?: string) {
  return {
    async list(orderBy?: string): Promise<T[]> {
      const col = orderBy || defaultOrderBy;
      const sql = `SELECT * FROM ${name}` + (col ? ` ORDER BY ${col} DESC` : '');
      const { rows } = await pool.query(sql);
      return rowsToCamel<T>(rows);
    },

    async getById(id: string): Promise<T | null> {
      const { rows } = await pool.query(`SELECT * FROM ${name} WHERE id = $1`, [id]);
      return rows[0] ? rowToCamel<T>(rows[0]) : null;
    },

    async create(data: Record<string, any>): Promise<T> {
      const entries = Object.entries(data).filter(([k, v]) => v !== undefined && k !== 'id'); // DB generates the id
      const cols = entries.map(([k]) => camelToSnake(k));
      const values = entries.map(([, v]) => v);
      const placeholders = values.map((_, i) => `$${i + 1}`);
      const sql = `INSERT INTO ${name} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
      const { rows } = await pool.query(sql, values);
      return rowToCamel<T>(rows[0]);
    },

    async update(id: string, data: Record<string, any>): Promise<T | null> {
      const entries = Object.entries(data).filter(([k, v]) => v !== undefined && k !== 'id');
      if (entries.length === 0) return this.getById(id);
      const setClauses = entries.map(([k], i) => `${camelToSnake(k)} = $${i + 1}`);
      const values = entries.map(([, v]) => v);
      const sql = `UPDATE ${name} SET ${setClauses.join(', ')} WHERE id = $${values.length + 1} RETURNING *`;
      const { rows } = await pool.query(sql, [...values, id]);
      return rows[0] ? rowToCamel<T>(rows[0]) : null;
    },

    async remove(id: string): Promise<boolean> {
      const { rowCount } = await pool.query(`DELETE FROM ${name} WHERE id = $1`, [id]);
      return (rowCount ?? 0) > 0;
    },

    async count(where?: string, params: any[] = []): Promise<number> {
      const sql = `SELECT COUNT(*)::int AS n FROM ${name}` + (where ? ` WHERE ${where}` : '');
      const { rows } = await pool.query(sql, params);
      return rows[0].n as number;
    },
  };
}
