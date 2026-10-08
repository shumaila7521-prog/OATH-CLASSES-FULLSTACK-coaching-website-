import { table } from '../lib/table';
import { createCrudRouter } from '../lib/crud';
import { requireAuth } from '../middleware/auth';

const t = table('notes', 'date');
const router = createCrudRouter(t);

router.put('/:id/publish', requireAuth, async (req, res) => {
  const item = await t.update(req.params.id, { published: !!req.body.published });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

export default router;
