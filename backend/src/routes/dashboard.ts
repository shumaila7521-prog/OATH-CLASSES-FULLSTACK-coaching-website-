import { Router } from 'express';
import { pool } from '../lib/db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/stats', requireAuth, async (_req, res) => {
  const q = (sql: string) => pool.query(sql).then((r) => Number(r.rows[0].n));
  const [totalStudents, newRegistrations, teachers, courses, batches, tests, pendingDoubts, pendingQuestions, results] =
    await Promise.all([
      q('SELECT COUNT(*)::int AS n FROM students'),
      q("SELECT COUNT(*)::int AS n FROM registrations WHERE status = 'pending'"),
      q('SELECT COUNT(*)::int AS n FROM teachers'),
      q('SELECT COUNT(*)::int AS n FROM courses'),
      q('SELECT COUNT(*)::int AS n FROM batches'),
      q('SELECT COUNT(*)::int AS n FROM tests'),
      q("SELECT COUNT(*)::int AS n FROM doubts WHERE status = 'Pending'"),
      q("SELECT COUNT(*)::int AS n FROM qna WHERE status = 'Pending'"),
      q('SELECT COUNT(*)::int AS n FROM results'),
    ]);

  res.json({ totalStudents, newRegistrations, teachers, courses, batches, tests, pendingDoubts, pendingQuestions, results });
});

export default router;
