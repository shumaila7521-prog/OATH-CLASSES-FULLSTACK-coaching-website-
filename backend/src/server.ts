import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import studentsRoutes from './routes/students';
import registrationsRoutes from './routes/registrations';
import teachersRoutes from './routes/teachers';
import coursesRoutes from './routes/courses';
import batchesRoutes from './routes/batches';
import notesRoutes from './routes/notes';
import testsRoutes from './routes/tests';
import questionBankRoutes from './routes/questionBank';
import resultsRoutes from './routes/results';
import questionPapersRoutes from './routes/questionPapers';
import doubtsRoutes from './routes/doubts';
import qnaRoutes from './routes/qna';
import announcementsRoutes from './routes/announcements';
import publicRoutes from './routes/public';
import uploadRoutes, { UPLOAD_DIR } from './routes/upload';

const app = express();
const PORT = process.env.PORT || 5000;
const origins = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);

// crossOriginResourcePolicy: the websites (ports 5173/5174) load images/PDFs from this API's origin
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const localDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || origins.includes(origin) || localDev.test(origin) || origins.length === 0),
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Generous limit — this is an admissions/admin API, not high traffic.
// The public registration endpoint is the one worth guarding against spam.
const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use('/api/registrations', (req, res, next) => (req.method === 'POST' ? registerLimiter(req, res, next) : next()));

// Uploaded files (doubt images, notes, papers). nosniff stops browsers from executing them as scripts.
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  })
);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/question-bank', questionBankRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/question-papers', questionPapersRoutes);
app.use('/api/doubts', doubtsRoutes);
app.use('/api/qna', qnaRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`OATH Classes API listening on http://localhost:${PORT}`);
});
