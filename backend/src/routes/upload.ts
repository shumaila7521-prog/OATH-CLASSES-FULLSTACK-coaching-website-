import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/** Storage for uploaded files. Preserves original extension or uses fallback. */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname || '').toLowerCase();
    if (!ext) {
      const mime = (file.mimetype || '').toLowerCase();
      if (mime.includes('png')) ext = '.png';
      else if (mime.includes('gif')) ext = '.gif';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('pdf')) ext = '.pdf';
      else ext = '.jpg';
    }
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

function makeUploader() {
  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10 MB
    fileFilter: (_req, _file, cb) => cb(null, true),
  }).single('file');
}

const imageUpload = makeUploader();
const docUpload = makeUploader();

const router = Router();

function respond(req: any, res: any, err: any) {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large (max 10 MB)' });
    if (err.message === 'INVALID_TYPE') return res.status(400).json({ error: 'Invalid file type' });
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
  if (!req.file) return res.status(400).json({ error: 'No file received (field name must be "file")' });
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    name: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype,
  });
}

/**
 * PUBLIC: students attach a photo to a doubt. Images only (jpg/jpeg/png),
 * heavily rate-limited because no login is required.
 */
const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
router.post('/image', publicLimiter, (req, res) => {
  imageUpload(req, res, (err) => respond(req, res, err));
});

/** ADMIN/TEACHER: notes & question papers (pdf, jpg, jpeg, png). */
router.post('/', requireAuth, (req, res) => {
  docUpload(req, res, (err) => respond(req, res, err));
});

export default router;


