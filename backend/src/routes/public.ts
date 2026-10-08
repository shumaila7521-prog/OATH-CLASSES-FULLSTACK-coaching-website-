import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { pool, rowsToCamel } from '../lib/db';

/**
 * PUBLIC routes for the student website. No login.
 *
 * Rules that keep this safe:
 *  - GET lists only ever return rows the teacher/admin has PUBLISHED.
 *  - Students never get a "list all doubts" endpoint. A student can read back
 *    only the doubts whose (unguessable) ids their own browser remembers.
 *  - Writes are validated (zod), length-limited and rate-limited.
 */
const router = Router();

const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

/** First zod issue as a readable message, e.g. "studentName is required". */
const firstError = (e: z.ZodError, fallback: string) => {
  const i = e.issues[0];
  if (!i) return fallback;
  return i.message === 'Required' ? `${i.path.join('.')} is required` : i.message;
};

const ms = (v: any): number | undefined => (v ? new Date(v).getTime() : undefined);

/** DB doubt row -> the shape the student site's `Doubt` type expects. */
function doubtOut(r: any) {
  return {
    id: r.id,
    studentName: r.student,
    subject: r.subject ?? '',
    topic: r.topic ?? '',
    question: r.question,
    imageUrl: r.attachment || undefined,
    attachment: r.attachment || undefined,
    status: String(r.status).toLowerCase() === 'answered' ? 'answered' : 'pending',
    answer: r.answer || undefined,
    answeredAt: ms(r.answered_at),
    createdAt: ms(r.created_at) ?? Date.now(),
  };
}

/** DB qna row -> the student site's `QAItem` shape. */
function qnaOut(r: any) {
  return {
    id: r.id,
    studentName: r.student || 'Student',
    subject: r.subject ?? '',
    question: r.question,
    answer: r.answer || undefined,
    createdAt: ms(r.date) ?? Date.now(),
  };
}

/* ---------------- Read-only lists (published only) ---------------- */

router.get('/notes', async (_req, res) => {
  const { rows } = await pool.query(`SELECT * FROM notes WHERE published = true ORDER BY date DESC`);
  res.json(rowsToCamel(rows));
});

router.get('/papers', async (_req, res) => {
  const { rows } = await pool.query(`SELECT * FROM question_papers WHERE published = true ORDER BY exam_date DESC NULLS LAST`);
  res.json(rowsToCamel(rows));
});

router.get('/tests', async (_req, res) => {
  const { rows } = await pool.query(`SELECT * FROM tests WHERE published = true ORDER BY date DESC NULLS LAST`);
  res.json(rowsToCamel(rows));
});

router.get('/announcements', async (_req, res) => {
  const { rows } = await pool.query(`SELECT * FROM announcements WHERE published = true ORDER BY date DESC`);
  res.json(rowsToCamel(rows));
});

/** Q&A board: only questions the teacher has answered are public. */
router.get('/qna', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM qna WHERE status = 'Answered' AND COALESCE(answer, '') <> '' ORDER BY date DESC`
  );
  res.json(rows.map(qnaOut));
});

/* ---------------- Doubts ---------------- */

const UploadUrl = z.string().min(1, 'Invalid attachment');

const DoubtInput = z.object({
  studentName: z.string().trim().min(1, 'Name is required').max(80),
  subject: z.string().trim().min(1).max(60),
  topic: z.string().trim().max(120).optional(),
  question: z.string().trim().min(1, 'Question is required').max(3000),
  imageUrl: UploadUrl.optional().nullable(), // the URL returned by POST /api/upload/image
  attachment: UploadUrl.optional().nullable(),
});

router.post('/doubts', writeLimiter, async (req, res) => {
  const parsed = DoubtInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: firstError(parsed.error, 'Invalid doubt') });
  const d = parsed.data;
  const imgPath = d.imageUrl || d.attachment || null;
  const { rows } = await pool.query(
    `INSERT INTO doubts (student, subject, topic, question, attachment, status)
     VALUES ($1,$2,$3,$4,$5,'Pending') RETURNING *`,
    [d.studentName, d.subject, d.topic ?? null, d.question, imgPath]
  );
  res.status(201).json(doubtOut(rows[0]));
});

/**
 * GET /api/public/doubts?ids=a,b,c — lets a student's browser fetch the
 * current status / teacher answer of the doubts it submitted earlier.
 */
router.get('/doubts', async (req, res) => {
  const ids = String(req.query.ids ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[\w-]{1,64}$/.test(s))
    .slice(0, 50);
  if (ids.length === 0) return res.json([]);
  const { rows } = await pool.query(`SELECT * FROM doubts WHERE id = ANY($1::text[]) ORDER BY created_at DESC`, [ids]);
  res.json(rows.map(doubtOut));
});

router.delete('/doubts/:id', async (req, res) => {
  const { rowCount } = await pool.query(`DELETE FROM doubts WHERE id = $1`, [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Doubt not found' });
  res.json({ success: true });
});

/* ---------------- Q&A ---------------- */

const QnaInput = z.object({
  studentName: z.string().trim().max(80).optional(),
  subject: z.string().trim().min(1).max(60),
  question: z.string().trim().min(1, 'Question is required').max(2000),
});

router.post('/qna', writeLimiter, async (req, res) => {
  const parsed = QnaInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: firstError(parsed.error, 'Invalid question') });
  const d = parsed.data;
  const { rows } = await pool.query(
    `INSERT INTO qna (student, subject, question, status) VALUES ($1,$2,$3,'Pending') RETURNING *`,
    [d.studentName || 'Student', d.subject, d.question]
  );
  res.status(201).json(qnaOut(rows[0]));
});

export default router;
