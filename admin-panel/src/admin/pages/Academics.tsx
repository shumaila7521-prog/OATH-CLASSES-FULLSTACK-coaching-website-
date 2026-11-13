import React, { useState } from 'react';
import * as api from '../../services/api';
import { Badge, Button, Card, Field, Input, Loading, Modal, PageHeader, Select, Table, Textarea, useApi } from '../ui';

const COURSE_OPTS = ['Class 9-10 Foundation', 'Class 11-12', 'NMMS', 'MAT', 'SAT'];

function PublishToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${on ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-slate-200'}`}>
      {on ? 'Published' : 'Unpublished'}
    </button>
  );
}

/* ================= NOTES ================= */
export function Notes({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getNotes);
  const [form, setForm] = useState<any>(null);
  const empty = { title: '', subject: '', chapter: '', topic: '', course: 'NMMS', batch: '', file: '', published: false, date: new Date().toISOString().slice(0, 10) };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
      await api.updateNote(form.id, form);
      setData((d) => (d ?? []).map((n) => (n.id === form.id ? form : n)));
      toast('Note updated');
    } else {
      const saved: any = await api.uploadNote(form);
      setData((d) => [...(d ?? []), saved]);
      toast('Note uploaded');
    }
    setForm(null);
  };

  return (
    <div>
      <PageHeader title="Notes" subtitle="Upload & publish study material (file storage handled by backend)"
        action={<Button onClick={() => setForm({ ...empty })}>+ Upload Note</Button>} />
      <Card>
        {loading ? <Loading /> : (
          <Table head={['Title', 'Subject', 'Chapter / Topic', 'Course', 'Batch', 'Date', 'Status', '']}>
            {(data ?? []).map((n) => (
              <tr key={n.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{n.title}</td>
                <td className="px-4 py-3">{n.subject}</td>
                <td className="px-4 py-3 text-slate-500">{n.chapter} / {n.topic}</td>
                <td className="px-4 py-3">{n.course}</td>
                <td className="px-4 py-3 text-slate-500">{n.batch}</td>
                <td className="px-4 py-3 text-slate-500">{n.date}</td>
                <td className="px-4 py-3">
                  <PublishToggle on={n.published} onClick={async () => {
                    await api.publishNote(n.id, !n.published);
                    setData((d) => (d ?? []).map((x) => (x.id === n.id ? { ...x, published: !x.published } : x)));
                    toast('Note publish status updated');
                  }} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="soft" onClick={() => setForm(n)}>Edit</Button>
                    <Button variant="danger" onClick={async () => {
                      await api.deleteNote(n.id);
                      setData((d) => (d ?? []).filter((x) => x.id !== n.id));
                      toast('Note deleted');
                    }}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {form && (
        <Modal wide title={form.id ? 'Edit Note' : 'Upload Note'} onClose={() => setForm(null)}>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={save}>
            <Field label="Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Subject"><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
            <Field label="Chapter"><Input value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} /></Field>
            <Field label="Topic"><Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></Field>
            <Field label="Course"><Select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              {COURSE_OPTS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Batch"><Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="File (PDF)">
              <input type="file" className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-6 text-sm"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try { const url = await api.uploadFile(f); setForm((x: any) => ({ ...x, file: url })); toast('File uploaded: ' + f.name); }
                  catch (err: any) { toast(err.message || 'File upload failed'); }
                }} />
              {form.file && <p className="mt-1 text-xs text-emerald-600">Attached: {form.file}</p>}</Field></div>
            <div className="sm:col-span-2"><Button type="submit">{form.id ? 'Save Changes' : 'Upload'}</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ================= TESTS ================= */
export function Tests({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getTests);
  const [form, setForm] = useState<any>(null);
  const empty = { title: '', course: 'NMMS', batch: '', questions: 50, duration: 60, marks: 50, date: '', published: false };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) { await api.updateTest(form.id, form); setData((d) => (d ?? []).map((t) => (t.id === form.id ? form : t))); toast('Test updated'); }
    else { const saved: any = await api.createTest(form); setData((d) => [...(d ?? []), saved]); toast('Test created'); }
    setForm(null);
  };

  return (
    <div>
      <PageHeader title="Tests" subtitle="Create, schedule and publish tests"
        action={<Button onClick={() => setForm({ ...empty })}>+ Create Test</Button>} />
      <Card>
        {loading ? <Loading /> : (
          <Table head={['Test', 'Course', 'Batch', 'Questions', 'Duration', 'Marks', 'Date / Time', 'Status', '']}>
            {(data ?? []).map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{t.title}</td>
                <td className="px-4 py-3">{t.course}</td>
                <td className="px-4 py-3 text-slate-500">{t.batch}</td>
                <td className="px-4 py-3">{t.questions}</td>
                <td className="px-4 py-3">{t.duration} min</td>
                <td className="px-4 py-3">{t.marks}</td>
                <td className="px-4 py-3 text-slate-500">{t.date}</td>
                <td className="px-4 py-3"><PublishToggle on={t.published} onClick={async () => {
                  await api.publishTest(t.id, !t.published);
                  setData((d) => (d ?? []).map((x) => (x.id === t.id ? { ...x, published: !x.published } : x)));
                  toast('Test publish status updated');
                }} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="soft" onClick={() => setForm(t)}>Edit</Button>
                    <Button variant="danger" onClick={async () => {
                      await api.deleteTest(t.id);
                      setData((d) => (d ?? []).filter((x) => x.id !== t.id));
                      toast('Test deleted');
                    }}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {form && (
        <Modal wide title={form.id ? 'Edit Test' : 'Create Test'} onClose={() => setForm(null)}>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={save}>
            <div className="sm:col-span-2"><Field label="Test Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field></div>
            <Field label="Course"><Select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              {COURSE_OPTS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Batch"><Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></Field>
            <Field label="No. of Questions"><Input type="number" value={form.questions} onChange={(e) => setForm({ ...form, questions: +e.target.value })} /></Field>
            <Field label="Duration (min)"><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} /></Field>
            <Field label="Total Marks"><Input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: +e.target.value })} /></Field>
            <Field label="Date & Time"><Input type="datetime-local" value={form.date ? form.date.replace(' ', 'T') : ''} onChange={(e) => setForm({ ...form, date: e.target.value.replace('T', ' ') })} /></Field>
            <div className="sm:col-span-2"><Button type="submit">Save Test</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ================= QUESTION BANK ================= */
export function QuestionBank({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getQuestionBank);
  const [form, setForm] = useState<any>(null);
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const empty = { text: '', subject: 'MAT', topic: '', difficulty: 'Easy', type: 'MCQ', options: ['', '', '', ''], answer: '' };
  const list = (data ?? []).filter((q) => (subject === 'All' || q.subject === subject) && (difficulty === 'All' || q.difficulty === difficulty));

  return (
    <div>
      <PageHeader title="Question Bank" subtitle="Subject, topic, difficulty, options & correct answer"
        action={<Button onClick={() => setForm({ ...empty })}>+ Add Question</Button>} />
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
            {['All', 'MAT', 'SAT', 'Science', 'Physics', 'Maths'].map((s) => <option key={s}>{s}</option>)}</Select>
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {['All', 'Easy', 'Medium', 'Hard'].map((s) => <option key={s}>{s}</option>)}</Select>
        </div>
      </Card>
      {loading ? <Loading /> : (
        <div className="space-y-3">
          {list.map((q) => (
            <Card key={q.id} className="p-5">
              <div className="mb-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-[#12304F] px-2 py-0.5 font-semibold text-white">{q.subject}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">{q.topic}</span>
                <Badge status={q.difficulty} /><span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">{q.type}</span>
              </div>
              <p className="font-medium text-slate-800">{q.text}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {q.options.map((o: string, i: number) => (
                  <div key={i} className={`rounded-lg border px-3 py-1.5 text-sm ${o === q.answer ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600'}`}>
                    {String.fromCharCode(65 + i)}. {o}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      {form && (
        <Modal wide title="Add Question" onClose={() => setForm(null)}>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={async (e) => {
            e.preventDefault();
            const q = { ...form, id: 'Q' + Math.random().toString().slice(2, 4) };
            await api.createQuestion(q); setData((d) => [...(d ?? []), q]); toast('Question added'); setForm(null);
          }}>
            <div className="sm:col-span-2"><Field label="Question"><Textarea required rows={2} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></Field></div>
            <Field label="Subject"><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
            <Field label="Topic"><Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></Field>
            <Field label="Difficulty"><Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {['Easy', 'Medium', 'Hard'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
            <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['MCQ', 'True/False', 'Short Answer'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
            {form.options.map((o: string, i: number) => (
              <Field key={i} label={`Option ${String.fromCharCode(65 + i)}`}>
                <Input value={o} onChange={(e) => { const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts }); }} />
              </Field>
            ))}
            <div className="sm:col-span-2"><Field label="Correct Answer"><Input required value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></Field></div>
            <div className="sm:col-span-2"><Button type="submit">Save Question</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ================= RESULTS ================= */
export function Results({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getResults);
  return (
    <div>
      <PageHeader title="Results" subtitle="Test submissions, marks and publishing" />
      <Card>
        {loading ? <Loading /> : (
          <Table head={['Student', 'Test', 'Marks', 'Percentage', 'Remarks', 'Status', '']}>
            {(data ?? []).map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{r.student}</td>
                <td className="px-4 py-3">{r.test}</td>
                <td className="px-4 py-3">{r.marks}/{r.total}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${r.percentage}%` }} /></div>
                    <span className="text-xs text-slate-500">{r.percentage}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{r.remark}</td>
                <td className="px-4 py-3"><Badge status={r.published ? 'Published' : 'Draft'} /></td>
                <td className="px-4 py-3 text-right">
                  <Button variant={r.published ? 'soft' : 'primary'} disabled={r.published} onClick={async () => {
                    await api.publishResult(r.id);
                    setData((d) => (d ?? []).map((x) => (x.id === r.id ? { ...x, published: true } : x)));
                    toast('Result published');
                  }}>{r.published ? 'Published' : 'Publish'}</Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

/* ================= QUESTION PAPERS ================= */
export function QuestionPapers({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getQuestionPapers);
  const [form, setForm] = useState<any>(null);
  const empty = { title: '', course: 'NMMS', batch: '', subject: '', examDate: '', file: '', published: false };
  return (
    <div>
      <PageHeader title="Question Papers" subtitle="Previous year & practice papers"
        action={<Button onClick={() => setForm({ ...empty })}>+ Upload Paper</Button>} />
      <Card>
        {loading ? <Loading /> : (
          <Table head={['Title', 'Course', 'Batch', 'Subject', 'Exam Date', 'File', 'Status']}>
            {(data ?? []).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{p.title}</td>
                <td className="px-4 py-3">{p.course}</td>
                <td className="px-4 py-3 text-slate-500">{p.batch}</td>
                <td className="px-4 py-3">{p.subject}</td>
                <td className="px-4 py-3 text-slate-500">{p.examDate}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{p.file}</td>
                <td className="px-4 py-3"><PublishToggle on={p.published} onClick={async () => {
                  await api.publishQuestionPaper(p.id, !p.published);
                  setData((d) => (d ?? []).map((x) => (x.id === p.id ? { ...x, published: !x.published } : x)));
                  toast('Paper publish status updated');
                }} /></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {form && (
        <Modal wide title="Upload Question Paper" onClose={() => setForm(null)}>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={async (e) => {
            e.preventDefault();
            const saved: any = await api.uploadQuestionPaper(form); setData((d) => [...(d ?? []), saved]); toast('Paper uploaded'); setForm(null);
          }}>
            <div className="sm:col-span-2"><Field label="Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field></div>
            <Field label="Course"><Select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              {COURSE_OPTS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Batch"><Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></Field>
            <Field label="Subject"><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
            <Field label="Exam Date"><Input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="File">
              <input type="file" className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-6 text-sm"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try { const url = await api.uploadFile(f); setForm((x: any) => ({ ...x, file: url })); toast('File uploaded: ' + f.name); }
                  catch (err: any) { toast(err.message || 'File upload failed'); }
                }} />
              {form.file && <p className="mt-1 text-xs text-emerald-600">Attached: {form.file}</p>}</Field></div>
            <div className="sm:col-span-2"><Button type="submit">Upload</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ================= DOUBTS ================= */
export function Doubts({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getDoubts);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <div>
      <PageHeader title="Doubts" subtitle="Student doubts with attachments and answers" />
      {loading ? <Loading /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(data ?? []).map((d) => {
            const img = d.attachment || d.imageUrl;
            return (
              <Card key={d.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{d.student || d.studentName}</p>
                    <p className="text-xs text-slate-500">{d.subject} • {d.topic || 'General'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={d.status} />
                    <Button variant="danger" className="!px-2 !py-1 text-xs" onClick={async () => {
                      await api.deleteDoubt(d.id);
                      setData((x) => (x ?? []).filter((y) => y.id !== d.id));
                      toast('Doubt deleted');
                    }}>Delete</Button>
                  </div>
                </div>
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{d.question}</p>
                {img && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-slate-500 mb-1">🖼️ Doubt Image Attachment (Click to enlarge):</p>
                    <a href={api.fileUrl(img)} target="_blank" rel="noreferrer" className="inline-block">
                      <img src={api.fileUrl(img)} alt="Doubt Attachment" className="max-h-52 rounded-lg border border-slate-300 shadow-sm hover:opacity-90 transition" />
                    </a>
                  </div>
                )}
              {d.answer ? <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{d.answer}</p> : (
                <div className="mt-3 space-y-2">
                  <Textarea rows={2} placeholder="Write answer…" value={answers[d.id] ?? ''} onChange={(e) => setAnswers({ ...answers, [d.id]: e.target.value })} />
                  <Button disabled={!answers[d.id] || busy === d.id} onClick={async () => {
                    setBusy(d.id);
                    try {
                      await api.answerDoubt(d.id, answers[d.id]);
                      setData((x) => (x ?? []).map((y) => (y.id === d.id ? { ...y, answer: answers[d.id], status: 'Answered' } : y)));
                      toast('Doubt answered');
                    } catch { /* error toast shown by services/api.ts */ }
                    setBusy(null);
                  }}>{busy === d.id ? 'Sending…' : 'Send Answer'}</Button>
                </div>
              )}
            </Card>
          );
          })}
        </div>
      )}
    </div>
  );
}

/* ================= Q&A ================= */
export function QnA({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getQuestions);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return (
    <div>
      <PageHeader title="Q&A" subtitle="General student questions" />
      <Card>
        {loading ? <Loading /> : (
          <Table head={['Student', 'Subject', 'Question', 'Date', 'Answer', 'Status']}>
            {(data ?? []).map((q) => (
              <tr key={q.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{q.student}</td>
                <td className="px-4 py-3">{q.subject}</td>
                <td className="px-4 py-3 text-slate-600">{q.question}</td>
                <td className="px-4 py-3 text-slate-500">{q.date}</td>
                <td className="px-4 py-3">
                  {q.answer ? <span className="text-emerald-700">{q.answer}</span> : (
                    <div className="flex gap-2">
                      <Input className="!w-48" placeholder="Answer…" value={answers[q.id] ?? ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                      <Button disabled={!answers[q.id]} onClick={async () => {
                        await api.answerQuestion(q.id, answers[q.id]);
                        setData((d) => (d ?? []).map((x) => (x.id === q.id ? { ...x, answer: answers[q.id], status: 'Answered' } : x)));
                        toast('Answer submitted');
                      }}>Send</Button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3"><Badge status={q.status} /></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

/* ================= ANNOUNCEMENTS ================= */
export function Announcements({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getAnnouncements);
  const [form, setForm] = useState<any>(null);
  const empty = { title: '', body: '', course: 'All', batch: 'All', date: new Date().toISOString().slice(0, 10), published: true };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // The list is updated from what the SERVER returns (real id), never from a locally invented one.
      if (form.id) { const saved: any = await api.updateAnnouncement(form.id, form); setData((d) => (d ?? []).map((a) => (a.id === form.id ? saved : a))); toast('Announcement updated'); }
      else { const saved: any = await api.createAnnouncement(form); setData((d) => [saved, ...(d ?? [])]); toast(form.published ? 'Announcement published' : 'Announcement saved as draft'); }
      setForm(null);
    } catch { /* error toast already shown by services/api.ts; keep the form open */ }
  };

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Notices targeted to a course or batch"
        action={<Button onClick={() => setForm({ ...empty })}>+ Create Announcement</Button>} />
      {loading ? <Loading /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(data ?? []).map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-800">{a.title}</h3>
                <PublishToggle on={a.published} onClick={async () => {
                  await api.publishAnnouncement(a.id, !a.published);
                  setData((d) => (d ?? []).map((x) => (x.id === a.id ? { ...x, published: !x.published } : x)));
                  toast('Publish status updated');
                }} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{a.body}</p>
              <p className="mt-3 text-xs text-slate-400">Target: {a.course} • {a.batch || 'All'} — {String(a.date).slice(0, 10)}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="soft" onClick={() => setForm(a)}>Edit</Button>
                <Button variant="danger" onClick={async () => {
                  await api.deleteAnnouncement(a.id);
                  setData((d) => (d ?? []).filter((x) => x.id !== a.id)); toast('Announcement deleted');
                }}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {form && (
        <Modal title={form.id ? 'Edit Announcement' : 'Create Announcement'} onClose={() => setForm(null)}>
          <form className="space-y-3" onSubmit={save}>
            <Field label="Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Message"><Textarea rows={3} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Target Course"><Select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                {['All', ...COURSE_OPTS].map((c) => <option key={c}>{c}</option>)}</Select></Field>
              <Field label="Target Batch"><Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={!!form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Publish on the student website
            </label>
            <Button type="submit">Save Announcement</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
