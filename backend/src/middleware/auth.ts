import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'teacher';
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '12h' });
}

/** Requires a valid Bearer token. Any logged-in role (admin or teacher) passes. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'Missing Authorization token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthUser;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Requires the admin role specifically (teachers are blocked). */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}
