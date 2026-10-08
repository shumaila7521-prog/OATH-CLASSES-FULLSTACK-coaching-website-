import React, { useState } from 'react';
import * as api from '../../services/api';
import { Badge, Button, Card, Field, Input, Loading, Modal, PageHeader, Select, Table, useApi } from '../ui';

/* ================= DASHBOARD ================= */
const STAT_META: { key: string; label: string; icon: string; tint: string }[] = [
  { key: 'totalStudents', label: 'Total Students', icon: '🎓', tint: 'from-sky-500 to-sky-600' },
  { key: 'newRegistrations', label: 'New Registrations', icon: '📝', tint: 'from-amber-500 to-orange-600' },
  { key: 'teachers', label: 'Teachers', icon: '👩‍🏫', tint: 'from-violet-500 to-purple-600' },
  { key: 'courses', label: 'Courses', icon: '📚', tint: 'from-emerald-500 to-green-600' },
  { key: 'batches', label: 'Batches', icon: '🗂️', tint: 'from-cyan-500 to-teal-600' },
  { key: 'tests', label: 'Tests', icon: '🧪', tint: 'from-indigo-500 to-blue-700' },
  { key: 'pendingDoubts', label: 'Pending Doubts', icon: '❓', tint: 'from-rose-500 to-red-600' },
  { key: 'pendingQuestions', label: 'Pending Questions', icon: '💬', tint: 'from-pink-500 to-fuchsia-600' },
  { key: 'results', label: 'Results', icon: '🏆', tint: 'from-yellow-500 to-amber-600' },
];

export function Dashboard({ go }: { go: (p: string) => void }) {
  const stats = useApi(api.getDashboardStats);
  const regs = useApi(api.getRegistrations);
  const batches = useApi(api.getBatches);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Oath Classes — NMMS | MAT | SAT | Foundation" />
      {stats.loading || !stats.data ? <Loading /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STAT_META.map((m) => (
            <Card key={m.key} className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${m.tint} text-xl shadow`}>{m.icon}</div>
              <div>
                <p className="text-2xl font-bold text-[#12304F]">{(stats.data as any)[m.key]}</p>
                <p className="text-sm text-slate-500">{m.label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h3 className="font-semibold text-[#12304F]">Recent Registrations</h3>
            <Button variant="soft" onClick={() => go('registrations')}>View all</Button>
          </div>
          {regs.loading || !regs.data ? <Loading /> : (
            <Table head={['Student', 'Course', 'Date', 'Status']}>
              {regs.data.slice(0, 5).map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.student}</td>
                  <td className="px-4 py-3">{r.course}</td>
                  <td className="px-4 py-3 text-slate-500">{r.date}</td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
        <Card>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <h3 className="font-semibold text-[#12304F]">Batch Occupancy</h3>
            <Button variant="soft" onClick={() => go('batches')}>Manage</Button>
          </div>
          <div className="space-y-4 p-5">
            {(batches.data ?? []).map((b) => (
              <div key={b.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{b.name}</span>
                  <span className="text-slate-500">{b.filled}/{b.seats}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-[#12304F]" style={{ width: `${(b.filled / b.seats) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================= STUDENTS ================= */
export function Students() {
  const { data, loading } = useApi(api.getStudents);
  const [q, setQ] = useState('');
  const [course, setCourse] = useState('All');
  const [status, setStatus] = useState('All');
  const [view, setView] = useState<any>(null);
  const list = (data ?? []).filter((s) =>
    (s.name + s.id + s.mobile + s.city).toLowerCase().includes(q.toLowerCase()) &&
    (course === 'All' || s.course === course) &&
    (status === 'All' || s.enrollment === status));

  return (
    <div>
      <PageHeader title="Students" subtitle="Student list, search, filters and details" />
      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Search name, ID, mobile, city…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={course} onChange={(e) => setCourse(e.target.value)}>
            {['All', 'Class 9-10 Foundation', 'Class 11-12', 'NMMS', 'MAT', 'SAT'].map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {['All', 'Enrolled', 'Pending', 'Inactive'].map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
      </Card>
      <Card>
        {loading ? <Loading /> : (
          <Table head={['ID', 'Name', 'Course', 'Batch', 'Mobile', 'Status', '']}>
            {list.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                <td className="px-4 py-3">{s.course}</td>
                <td className="px-4 py-3 text-slate-500">{s.batch}</td>
                <td className="px-4 py-3">{s.mobile}</td>
                <td className="px-4 py-3"><Badge status={s.enrollment} /></td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" onClick={() => setView(s)}>View</Button></td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No students found</td></tr>}
          </Table>
        )}
      </Card>
      {view && (
        <Modal wide title={`Student — ${view.name}`} onClose={() => setView(null)}>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {[['Registration ID', view.id], ["Father's Name", view.father], ["Mother's Name", view.mother],
              ['Date of Birth', view.dob], ['Gender', view.gender], ['Mobile', view.mobile], ['WhatsApp', view.whatsapp],
              ['Email', view.email], ['City', view.city], ['State', view.state], ['PIN', view.pin],
              ['Previous Class', view.prevClass], ['School / College', view.school], ['Course', view.course],
              ['Batch', view.batch], ['Mode', view.mode], ['Enrollment Status', view.enrollment], ['Joined', view.joined],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">{k}</p>
                <p className="font-medium text-slate-800">{v}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================= REGISTRATIONS ================= */
export function Registrations({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getRegistrations);
  const [busy, setBusy] = useState<string | null>(null);
  const [view, setView] = useState<any>(null);
  const [edit, setEdit] = useState<any>(null);
  const [status, setStatus] = useState('All');

  const act = async (id: string, kind: 'Approved' | 'Rejected') => {
    setBusy(id + kind);
    try {
      kind === 'Approved' ? await api.approveRegistration(id) : await api.rejectRegistration(id);
      setData((d) => (d ?? []).map((r) => (r.id === id ? { ...r, status: kind } : r)));
      toast(`Registration ${id} ${kind.toLowerCase()}`);
    } catch { toast('Action failed — check API'); } finally { setBusy(null); }
  };

  const list = (data ?? []).filter((r) => status === 'All' || r.status === status);

  return (
    <div>
      <PageHeader title="Registrations" subtitle="Approve, reject or edit enrollment requests"
        action={<Select value={status} onChange={(e) => setStatus(e.target.value)} className="!w-44">
          {['All', 'Pending', 'Approved', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
        </Select>} />
      <Card>
        {loading ? <Loading /> : (
          <Table head={['Registration ID', 'Student', 'Course', 'Batch', 'Date', 'Status', 'Actions']}>
            {list.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{r.student}</td>
                <td className="px-4 py-3">{r.course}</td>
                <td className="px-4 py-3 text-slate-500">{r.batch}</td>
                <td className="px-4 py-3 text-slate-500">{r.date}</td>
                <td className="px-4 py-3"><Badge status={r.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => setView(r)}>View</Button>
                    <Button variant="success" disabled={busy === r.id + 'Approved'} onClick={() => act(r.id, 'Approved')}>
                      {busy === r.id + 'Approved' ? '…' : 'Approve'}
                    </Button>
                    <Button variant="danger" disabled={busy === r.id + 'Rejected'} onClick={() => act(r.id, 'Rejected')}>
                      {busy === r.id + 'Rejected' ? '…' : 'Reject'}
                    </Button>
                    <Button variant="soft" onClick={() => setEdit(r)}>Edit</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {view && (
        <Modal title={`Registration ${view.id}`} onClose={() => setView(null)}>
          <div className="space-y-2 text-sm">
            {Object.entries(view).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="capitalize text-slate-500">{k}</span><span className="font-medium text-slate-800">{String(v)}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {edit && (
        <Modal title={`Edit ${edit.id}`} onClose={() => setEdit(null)}>
          <form className="space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            await api.updateRegistration(edit.id, edit);
            setData((d) => (d ?? []).map((r) => (r.id === edit.id ? edit : r)));
            toast('Registration updated'); setEdit(null);
          }}>
            <Field label="Course"><Select value={edit.course} onChange={(e) => setEdit({ ...edit, course: e.target.value })}>
              {['Class 9-10 Foundation', 'Class 11-12', 'NMMS', 'MAT', 'SAT'].map((c) => <option key={c}>{c}</option>)}
            </Select></Field>
            <Field label="Batch"><Input value={edit.batch} onChange={(e) => setEdit({ ...edit, batch: e.target.value })} /></Field>
            <Field label="Status"><Select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
              {['Pending', 'Approved', 'Rejected'].map((c) => <option key={c}>{c}</option>)}
            </Select></Field>
            <Button type="submit">Save changes</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ================= TEACHERS ================= */
const EMPTY_TEACHER = { id: '', name: '', email: '', mobile: '', qualification: '', experience: '', subject: '', course: 'NMMS', batch: '', status: 'Active' };
export function Teachers({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getTeachers);
  const [form, setForm] = useState<any>(null);
  const [view, setView] = useState<any>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) { await api.updateTeacher(form.id, form); setData((d) => (d ?? []).map((t) => (t.id === form.id ? form : t))); toast('Teacher updated'); }
    else { const t = { ...form, id: 'T' + Math.random().toString().slice(2, 4) }; await api.createTeacher(t); setData((d) => [...(d ?? []), t]); toast('Teacher added'); }
    setForm(null);
  };

  return (
    <div>
      <PageHeader title="Teachers" subtitle="Faculty list and assignments"
        action={<Button onClick={() => setForm({ ...EMPTY_TEACHER })}>+ Add Teacher</Button>} />
      <Card>
        {loading ? <Loading /> : (
          <Table head={['Name', 'Subject', 'Course', 'Batch', 'Mobile', 'Status', '']}>
            {(data ?? []).map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                <td className="px-4 py-3">{t.subject}</td>
                <td className="px-4 py-3">{t.course}</td>
                <td className="px-4 py-3 text-slate-500">{t.batch}</td>
                <td className="px-4 py-3">{t.mobile}</td>
                <td className="px-4 py-3"><Badge status={t.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setView(t)}>Details</Button>
                    <Button variant="soft" onClick={() => setForm(t)}>Edit</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {view && <Modal title={view.name} onClose={() => setView(null)}>
        <div className="space-y-2 text-sm">
          {Object.entries(view).map(([k, v]) => <div key={k} className="flex justify-between border-b border-slate-100 py-1.5">
            <span className="capitalize text-slate-500">{k}</span><span className="font-medium text-slate-800">{String(v)}</span></div>)}
        </div>
      </Modal>}
      {form && (
        <Modal wide title={form.id ? 'Edit Teacher' : 'Add Teacher'} onClose={() => setForm(null)}>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={save}>
            <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Mobile"><Input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
            <Field label="Qualification"><Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></Field>
            <Field label="Experience"><Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></Field>
            <Field label="Assigned Subject"><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
            <Field label="Assigned Course"><Select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              {['Class 9-10 Foundation', 'Class 11-12', 'NMMS', 'MAT', 'SAT'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Assigned Batch"><Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Button type="submit">Save Teacher</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ================= COURSES ================= */
const EMPTY_COURSE = { id: '', name: '', code: '', fee: 0, duration: '', subjects: [] as string[], students: 0, status: 'Active' };
export function Courses({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getCourses);
  const [form, setForm] = useState<any>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, subjects: typeof form.subjects === 'string' ? form.subjects.split(',').map((s: string) => s.trim()) : form.subjects };
    if (payload.id) { await api.updateCourse(payload.id, payload); setData((d) => (d ?? []).map((c) => (c.id === payload.id ? payload : c))); toast('Course updated'); }
    else { payload.id = 'C' + Math.random().toString().slice(2, 4); await api.createCourse(payload); setData((d) => [...(d ?? []), payload]); toast('Course added'); }
    setForm(null);
  };

  return (
    <div>
      <PageHeader title="Courses" subtitle="Class 9-10 • Class 11-12 • NMMS • MAT • SAT"
        action={<Button onClick={() => setForm({ ...EMPTY_COURSE })}>+ Add Course</Button>} />
      {loading ? <Loading /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-md bg-[#12304F] px-2 py-0.5 text-xs font-bold text-white">{c.code}</span>
                  <h3 className="mt-2 font-semibold text-slate-800">{c.name}</h3>
                </div>
                <Badge status={c.status} />
              </div>
              <div className="mt-3 flex gap-6 text-sm">
                <div><p className="text-slate-400">Fee</p><p className="font-semibold text-slate-800">₹{c.fee.toLocaleString('en-IN')}</p></div>
                <div><p className="text-slate-400">Duration</p><p className="font-semibold text-slate-800">{c.duration}</p></div>
                <div><p className="text-slate-400">Students</p><p className="font-semibold text-slate-800">{c.students}</p></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.subjects.map((s: string) => <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{s}</span>)}
              </div>
              <Button variant="soft" className="mt-4" onClick={() => setForm({ ...c, subjects: c.subjects.join(', ') })}>Edit Course</Button>
            </Card>
          ))}
        </div>
      )}
      {form && (
        <Modal title={form.id ? 'Edit Course' : 'Add Course'} onClose={() => setForm(null)}>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={save}>
            <Field label="Course Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Code"><Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
            <Field label="Fee (₹)"><Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: +e.target.value })} /></Field>
            <Field label="Duration"><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Subjects (comma separated)">
              <Input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} /></Field></div>
            <div className="sm:col-span-2"><Button type="submit">Save Course</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ================= BATCHES ================= */
const EMPTY_BATCH = { id: '', name: '', number: '', course: 'NMMS', teacher: '', schedule: '', mode: 'Offline', seats: 40, filled: 0, status: 'Upcoming' };
export function Batches({ toast }: { toast: (m: string) => void }) {
  const { data, setData, loading } = useApi(api.getBatches);
  const [form, setForm] = useState<any>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) { await api.updateBatch(form.id, form); setData((d) => (d ?? []).map((b) => (b.id === form.id ? form : b))); toast('Batch updated'); }
    else { const b = { ...form, id: 'B' + Math.random().toString().slice(2, 4) }; await api.createBatch(b); setData((d) => [...(d ?? []), b]); toast('Batch created'); }
    setForm(null);
  };

  return (
    <div>
      <PageHeader title="Batches" subtitle="Batch schedule, teacher & course mapping"
        action={<Button onClick={() => setForm({ ...EMPTY_BATCH })}>+ Add Batch</Button>} />
      <Card>
        {loading ? <Loading /> : (
          <Table head={['Batch', 'Batch No.', 'Course', 'Teacher', 'Schedule', 'Mode', 'Seats', 'Status', '']}>
            {(data ?? []).map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{b.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{b.number}</td>
                <td className="px-4 py-3">{b.course}</td>
                <td className="px-4 py-3">{b.teacher}</td>
                <td className="px-4 py-3 text-slate-500">{b.schedule}</td>
                <td className="px-4 py-3">{b.mode}</td>
                <td className="px-4 py-3">{b.filled}/{b.seats}</td>
                <td className="px-4 py-3"><Badge status={b.status} /></td>
                <td className="px-4 py-3 text-right"><Button variant="soft" onClick={() => setForm(b)}>Edit</Button></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {form && (
        <Modal wide title={form.id ? 'Edit Batch' : 'Add Batch'} onClose={() => setForm(null)}>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={save}>
            <Field label="Batch Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Batch Number"><Input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></Field>
            <Field label="Course"><Select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              {['Class 9-10 Foundation', 'Class 11-12', 'NMMS', 'MAT', 'SAT'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Teacher"><Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></Field>
            <Field label="Schedule"><Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} /></Field>
            <Field label="Mode"><Select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
              {['Offline', 'Online', 'Hybrid'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Total Seats"><Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: +e.target.value })} /></Field>
            <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {['Upcoming', 'Running', 'Completed'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <div className="sm:col-span-2"><Button type="submit">Save Batch</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
