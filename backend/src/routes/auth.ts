import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../lib/db';
import { signToken } from '../middleware/auth';

const router = Router();

async function login(email: string, password: string, expectedRole: 'admin' | 'teacher') {
  const { rows } = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || user.role !== expectedRole) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  const token = signToken({ id: user.id, email: user.email, role: expectedRole, name: user.name });
  return { token, role: expectedRole, name: user.name };
}

router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const result = await login(email, password, 'admin');
  if (!result) return res.status(401).json({ error: 'Invalid admin credentials' });
  res.json(result);
});

router.post('/teacher/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const result = await login(email, password, 'teacher');
  if (!result) return res.status(401).json({ error: 'Invalid teacher credentials' });
  res.json(result);
});

router.post('/logout', (_req, res) => {
  // Stateless JWT — logout is a client-side token discard. Endpoint kept
  // for API-shape compatibility with the admin panel's api.ts.
  res.json({ success: true });
});

export default router;
