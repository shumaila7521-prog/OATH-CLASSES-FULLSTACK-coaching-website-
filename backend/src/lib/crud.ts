import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { table } from './table';

/** Builds a standard authenticated GET-list / GET-one / POST / PUT / DELETE router for a table(). */
export function createCrudRouter(t: ReturnType<typeof table>) {
  const router = Router();

  router.get('/', requireAuth, async (_req, res) => {
    res.json(await t.list());
  });

  router.get('/:id', requireAuth, async (req, res) => {
    const item = await t.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  });

  router.post('/', requireAuth, async (req, res) => {
    try {
      res.status(201).json(await t.create(req.body));
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Create failed' });
    }
  });

  router.put('/:id', requireAuth, async (req, res) => {
    try {
      const item = await t.update(req.params.id, req.body);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Update failed' });
    }
  });

  router.delete('/:id', requireAuth, async (req, res) => {
    const ok = await t.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });

  return router;
}
