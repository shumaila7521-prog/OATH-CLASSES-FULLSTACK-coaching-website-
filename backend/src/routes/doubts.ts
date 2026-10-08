import { table } from '../lib/table';
import { createCrudRouter } from '../lib/crud';
import { requireAuth } from '../middleware/auth';

const t = table('doubts', 'created_at');
const router = createCrudRouter(t);

router.post('/:id/answer', requireAuth, async (req, res) => {
  const item = await t.update(req.params.id, { answer: req.body.answer ?? '', status: 'Answered', answeredAt: new Date().toISOString() });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

export default router;
