import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../lib/db';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * The DB stores one canonical row. We serialize it with BOTH sets of
 * field names so the two already-built frontends keep working unmodified:
 *  - public site reads: studentName, createdAt (epoch ms)
 *  - admin panel reads: student, date (YYYY-MM-DD)
 */
function serialize(row: any) {
  const createdAt: Date = row.created_at;
  return {
    id: row.id,
    studentName: row.student_name,
    student: row.student_name,
    guardianName: row.guardian_name ?? '',
    phone: row.phone,
    email: row.email ?? '',
    course: row.course,
    batch: row.batch ?? '',
    school: row.school ?? '',
    address: row.address ?? '',
    message: row.message ?? '',
    mode: row.mode ?? '',
    status: row.status,
    createdAt: createdAt.getTime(),
    date: createdAt.toISOString().slice(0, 10),
  };
}

const RegistrationInput = z.object({
  studentName: z.string().min(1),
  guardianName: z.string().optional(),
  phone: z.string().min(1),
  email: z.string().optional(),
  course: z.string().min(1),
  batch: z.string().optional(),
  school: z.string().optional(),
  address: z.string().optional(),
  message: z.string().optional(),
  mode: z.string().optional(),
});

/** Public — hit by the Enroll Now form on the student site. No auth. */
router.post('/', async (req, res) => {
  const parsed = RegistrationInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid registration data' });
  }
  const d = parsed.data;
  const { rows } = await pool.query(
    `INSERT INTO registrations (student_name, guardian_name, phone, email, course, batch, school, address, message, mode, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending') RETURNING *`,
    [d.studentName, d.guardianName ?? null, d.phone, d.email ?? null, d.course, d.batch ?? null, d.school ?? null, d.address ?? null, d.message ?? null, d.mode ?? null]
  );
  res.status(201).json(serialize(rows[0]));
});

/** Admin/teacher — list all registrations. */
router.get('/', requireAuth, async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM registrations ORDER BY created_at DESC');
  res.json(rows.map(serialize));
});

router.get('/:id', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM registrations WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(serialize(rows[0]));
});

router.put('/:id', requireAuth, async (req, res) => {
  const allowed = ['studentName', 'guardianName', 'phone', 'email', 'course', 'batch', 'school', 'address', 'message', 'mode', 'status'] as const;
  const colMap: Record<string, string> = {
    studentName: 'student_name', guardianName: 'guardian_name', phone: 'phone', email: 'email',
    course: 'course', batch: 'batch', school: 'school', address: 'address', message: 'message',
    mode: 'mode', status: 'status',
  };
  const entries = Object.entries(req.body).filter(([k, v]) => allowed.includes(k as any) && v !== undefined);
  if (entries.length === 0) return res.status(400).json({ error: 'No valid fields to update' });
  const setClauses = entries.map(([k], i) => `${colMap[k]} = $${i + 1}`);
  const values = entries.map(([, v]) => v);
  const { rows } = await pool.query(
    `UPDATE registrations SET ${setClauses.join(', ')} WHERE id = $${values.length + 1} RETURNING *`,
    [...values, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(serialize(rows[0]));
});

router.post('/:id/approve', requireAuth, async (req, res) => {
  const found = await pool.query('SELECT * FROM registrations WHERE id = $1', [req.params.id]);
  const reg = found.rows[0];
  if (!reg) return res.status(404).json({ error: 'Not found' });
  await pool.query("UPDATE registrations SET status = 'approved' WHERE id = $1", [req.params.id]);
  // First approval turns the registration into a real student, so "Total Students" counts them.
  if (reg.status !== 'approved') {
    await pool.query(
      `INSERT INTO students (name, father, mobile, email, school, course, batch, mode, enrollment)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Enrolled')`,
      [reg.student_name, reg.guardian_name ?? null, reg.phone, reg.email ?? null, reg.school ?? null, reg.course, reg.batch ?? null, reg.mode ?? null]
    );
  }
  res.json({ success: true });
});

router.post('/:id/reject', requireAuth, async (req, res) => {
  const { rows } = await pool.query("UPDATE registrations SET status = 'rejected' WHERE id = $1 RETURNING id", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

export default router;
