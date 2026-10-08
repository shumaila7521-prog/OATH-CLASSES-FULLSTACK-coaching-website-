import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessagesSquare,
  HelpCircle,
  LogOut,
  Clock,
  CheckCircle2,
  Trash2,
  Send,
  Image as ImageIcon,
  Lock,
  Shield,
  TrendingUp,
  Users as UsersIcon,
  FileText,
  Menu,
  X,
  ClipboardList,
  Search,
  Phone,
  Mail,
  XCircle,
} from 'lucide-react';
import { useStore, Doubt, QAItem, ALL_SUBJECTS, Subject, Registration, RegistrationStatus } from '../lib/store';
import Logo from './Logo';

type AdminTab = 'dashboard' | 'doubts' | 'qa' | 'registrations';

export default function AdminDashboard({ onExit }: { onExit: () => void }) {
  const { doubts, qaItems, answerDoubt, deleteDoubt, answerQA, deleteQA, registrations, setRegistrationStatus, deleteRegistration } = useStore();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [selectedQA, setSelectedQA] = useState<QAItem | null>(null);
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const pending = doubts.filter((d) => d.status === 'pending').length;
  const answered = doubts.filter((d) => d.status === 'answered').length;
  const answeredQA = qaItems.filter((q) => q.answer).length;
  const pendingQA = qaItems.length - answeredQA;
  const pendingRegs = registrations.filter((r) => r.status === 'pending').length;
  const selectedReg = registrations.find((r) => r.id === selectedRegId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1d] flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 h-full md:h-auto w-72 navy-gradient text-white flex flex-col transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={44} showText={false} />
            <div>
              <div className="font-display font-black text-lg leading-none">OATH</div>
              <div className="text-[10px] tracking-[0.25em] text-[#D4AF37] font-bold">ADMIN PANEL</div>
            </div>
          </div>
          <button className="md:hidden text-white/80" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          <SideLink active={tab === 'dashboard'} icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" onClick={() => { setTab('dashboard'); setSidebarOpen(false); }} />
          <SideLink active={tab === 'doubts'} icon={<MessagesSquare className="w-4 h-4" />} label={`Doubts (${pending + answered})`} onClick={() => { setTab('doubts'); setSidebarOpen(false); }} badge={pending} />
          <SideLink active={tab === 'qa'} icon={<HelpCircle className="w-4 h-4" />} label={`Q&A (${qaItems.length})`} onClick={() => { setTab('qa'); setSidebarOpen(false); }} badge={pendingQA} />
          <SideLink active={tab === 'registrations'} icon={<ClipboardList className="w-4 h-4" />} label={`Registrations (${registrations.length})`} onClick={() => { setTab('registrations'); setSidebarOpen(false); }} badge={pendingRegs} />
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-red-500/20 text-red-200 transition"
          >
            <LogOut className="w-4 h-4" />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0b1020]/90 backdrop-blur border-b border-slate-200 dark:border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-700 dark:text-slate-200" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-display font-black text-xl md:text-2xl text-[#0F2449] dark:text-white capitalize">{tab === 'qa' ? 'Question Management' : tab}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tab === 'dashboard' && 'Overview of student activity and doubts'}
                {tab === 'doubts' && 'Review and answer student doubts'}
                {tab === 'qa' && 'Answer, edit or moderate Q&A entries'}
                {tab === 'registrations' && 'Students who registered through Enroll Now'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Teacher Access
          </div>
        </header>

        <div className="p-4 md:p-8">
          {tab === 'dashboard' && (
            <DashboardView pending={pending} answered={answered} totalQA={qaItems.length} answeredQA={answeredQA} pendingQA={pendingQA} />
          )}
          {tab === 'doubts' && (
            <DoubtListView
              doubts={doubts}
              onSelect={(d) => { setSelectedDoubt(d); setAnswerText(d.answer ?? ''); }}
              onDelete={deleteDoubt}
            />
          )}
          {tab === 'registrations' && (
            <RegistrationListView registrations={registrations} onSelect={(r) => setSelectedRegId(r.id)} />
          )}
          {tab === 'qa' && (
            <QAListView
              items={qaItems}
              onSelect={(q) => { setSelectedQA(q); setAnswerText(q.answer ?? ''); }}
              onDelete={deleteQA}
            />
          )}
        </div>
      </main>

      {/* Doubt answer modal */}
      <AnimatePresence>
        {selectedReg && (
          <Modal onClose={() => setSelectedRegId(null)} title="Registration Details">
            <RegistrationDetail
              reg={selectedReg}
              onStatus={(st) => setRegistrationStatus(selectedReg.id, st)}
              onDelete={() => {
                deleteRegistration(selectedReg.id);
                setSelectedRegId(null);
              }}
            />
          </Modal>
        )}
        {selectedDoubt && (
          <Modal onClose={() => setSelectedDoubt(null)} title="Respond to Doubt">
            <DoubtDetail
              item={selectedDoubt}
              answerText={answerText}
              setAnswerText={setAnswerText}
              onSubmit={() => {
                if (answerText.trim()) {
                  answerDoubt(selectedDoubt.id, answerText.trim());
                  setSelectedDoubt(null);
                  setAnswerText('');
                }
              }}
              onDelete={() => {
                deleteDoubt(selectedDoubt.id);
                setSelectedDoubt(null);
              }}
              typeLabel="Doubt"
            />
          </Modal>
        )}
        {selectedQA && (
          <Modal onClose={() => setSelectedQA(null)} title="Respond to Question">
            <DoubtDetail
              item={{
                id: selectedQA.id,
                studentName: selectedQA.studentName ?? 'Student',
                subject: selectedQA.subject,
                question: selectedQA.question,
                status: selectedQA.answer ? 'answered' : 'pending',
                answer: selectedQA.answer,
                createdAt: selectedQA.createdAt,
              }}
              answerText={answerText}
              setAnswerText={setAnswerText}
              onSubmit={() => {
                if (answerText.trim()) {
                  answerQA(selectedQA.id, answerText.trim());
                  setSelectedQA(null);
                  setAnswerText('');
                }
              }}
              onDelete={() => {
                deleteQA(selectedQA.id);
                setSelectedQA(null);
              }}
              typeLabel="Q&A"
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function SideLink({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
        active ? 'bg-[#D4AF37] text-[#0a0c28] shadow-lg shadow-yellow-500/20' : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-[#0a0c28] text-[#D4AF37]' : 'bg-red-500 text-white'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function DashboardView({ pending, answered, totalQA, answeredQA, pendingQA }: { pending: number; answered: number; totalQA: number; answeredQA: number; pendingQA: number }) {
  const stats = [
    { label: 'Total Doubts Received', value: pending + answered, icon: <MessagesSquare className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600' },
    { label: 'Pending Doubts', value: pending, icon: <Clock className="w-5 h-5" />, color: 'from-amber-500 to-orange-600' },
    { label: 'Doubts Answered', value: answered, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-emerald-500 to-teal-600' },
    { label: 'Total Q&A Items', value: totalQA, icon: <HelpCircle className="w-5 h-5" />, color: 'from-violet-500 to-purple-600' },
    { label: 'Answered Q&As', value: answeredQA, icon: <FileText className="w-5 h-5" />, color: 'from-sky-500 to-cyan-600' },
    { label: 'Pending Q&As', value: pendingQA, icon: <Lock className="w-5 h-5" />, color: 'from-rose-500 to-red-600' },
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 premium-shadow border border-slate-100"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-3 shadow-lg`}>
              {s.icon}
            </div>
            <div className="text-3xl font-display font-black text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 premium-shadow border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-display font-bold text-lg">Student Activity</h3>
          </div>
          <div className="space-y-3">
            <Activity label="Doubts resolved" value={answered} total={Math.max(pending + answered, 1)} color="bg-emerald-500" />
            <Activity label="Pending follow-up" value={pending} total={Math.max(pending + answered, 1)} color="bg-amber-500" />
            <Activity label="Q&A answered" value={answeredQA} total={Math.max(totalQA, 1)} color="bg-violet-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#0a0c28] to-[#1e2259] text-white rounded-2xl p-6 premium-shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-display font-bold text-lg">Quick Actions</h3>
            </div>
            <p className="text-sm text-white/70 mb-4">Ready to help students? Go to the Doubts tab to start answering.</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[#D4AF37] font-bold text-lg">{pending}</div>
                <div className="text-white/70">New Doubts</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-[#D4AF37] font-bold text-lg">{pendingQA}</div>
                <div className="text-white/70">Open Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Activity({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1.5">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500">{value} / {total}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className={`h-full ${color} rounded-full`} />
      </div>
    </div>
  );
}

function DoubtListView({ doubts, onSelect, onDelete }: { doubts: Doubt[]; onSelect: (d: Doubt) => void; onDelete: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [subj, setSubj] = useState<Subject | 'all'>('all');

  const filtered = useMemo(() => {
    return doubts
      .filter((d) => (filter === 'all' ? true : d.status === filter))
      .filter((d) => (subj === 'all' ? true : d.subject === subj));
  }, [doubts, filter, subj]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'answered'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
            filter === f ? 'navy-gradient text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#D4AF37]'
          }`}>
            {f} ({f === 'all' ? doubts.length : doubts.filter((d) => d.status === f).length})
          </button>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          <select value={subj} onChange={(e) => setSubj(e.target.value as Subject | 'all')} className="px-3 py-2 rounded-full text-sm border border-slate-200 bg-white">
            <option value="all">All Subjects</option>
            {ALL_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<MessagesSquare className="w-10 h-10" />} title="No doubts here yet" subtitle="Student doubts will appear here when they submit them." />
      ) : (
        <div className="grid gap-3">
          {filtered.map((d) => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 premium-shadow border border-slate-100 hover:border-[#D4AF37] transition"
            >
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  d.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {d.status === 'pending' ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-navy-50 text-navy-700">{d.subject}</span>
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${d.status === 'pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {d.status}
                    </span>
                    {d.imageUrl && <span className="text-[11px] text-slate-500 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image attached</span>}
                    <span className="text-[11px] text-slate-400 ml-auto">{new Date(d.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">{d.studentName}</div>
                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">{d.question}</p>
                  {d.answer && <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2 line-clamp-2"><strong>Answer:</strong> {d.answer}</p>}
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => onSelect(d)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] text-[#0a0c28] hover:brightness-110 transition">
                    {d.status === 'answered' ? 'Edit' : 'Answer'}
                  </button>
                  <button onClick={() => { if (confirm('Delete this doubt?')) onDelete(d.id); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition">
                    <Trash2 className="w-3.5 h-3.5 inline" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function QAListView({ items, onSelect, onDelete }: { items: QAItem[]; onSelect: (q: QAItem) => void; onDelete: (id: string) => void }) {
  const [subj, setSubj] = useState<Subject | 'all'>('all');
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    return items
      .filter((q) => (subj === 'all' ? true : q.subject === subj))
      .filter((q) => !search || q.question.toLowerCase().includes(search.toLowerCase()) || (q.answer ?? '').toLowerCase().includes(search.toLowerCase()));
  }, [items, subj, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input placeholder="Search questions or answers…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-4 py-2.5 rounded-full text-sm border border-slate-200 bg-white focus:outline-none focus:border-[#D4AF37]" />
        <select value={subj} onChange={(e) => setSubj(e.target.value as Subject | 'all')} className="px-4 py-2.5 rounded-full text-sm border border-slate-200 bg-white">
          <option value="all">All Subjects</option>
          {ALL_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<HelpCircle className="w-10 h-10" />} title="No Q&A items" subtitle="When students post questions, they will appear here." />
      ) : (
        <div className="grid gap-3">
          {filtered.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl p-4 premium-shadow border border-slate-100">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">{q.subject}</span>
                <span className={`text-[11px] font-semibold uppercase ${q.answer ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {q.answer ? 'Answered' : 'Pending'}
                </span>
                <span className="text-[11px] text-slate-400 ml-auto">{new Date(q.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="font-medium text-slate-900 text-sm mt-1">{q.question}</p>
              {q.answer && <p className="text-sm text-slate-600 mt-2 border-l-2 border-[#D4AF37] pl-3">{q.answer}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => onSelect(q)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] text-[#0a0c28] hover:brightness-110">
                  {q.answer ? 'Edit Answer' : 'Answer'}
                </button>
                <button onClick={() => { if (confirm('Delete this question?')) onDelete(q.id); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100">
                  <Trash2 className="w-3.5 h-3.5 inline" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const REG_STATUS_STYLE: Record<RegistrationStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

function StatusPill({ status }: { status: RegistrationStatus }) {
  return <span className={`inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${REG_STATUS_STYLE[status]}`}>{status}</span>;
}

function RegistrationListView({ registrations, onSelect }: { registrations: Registration[]; onSelect: (r: Registration) => void }) {
  const [filter, setFilter] = useState<'all' | RegistrationStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registrations
      .filter((r) => (filter === 'all' ? true : r.status === filter))
      .filter((r) => !q || [r.studentName, r.email, r.phone, r.course].some((v) => v.toLowerCase().includes(q)));
  }, [registrations, filter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
            filter === f ? 'navy-gradient text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#D4AF37]'
          }`}>
            {f} ({f === 'all' ? registrations.length : registrations.filter((r) => r.status === f).length})
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input placeholder="Search name, phone, email…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-full text-sm border border-slate-200 bg-white focus:outline-none focus:border-[#D4AF37]" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList className="w-10 h-10" />} title="No registrations yet" subtitle="Students who register through Enroll Now will appear here." />
      ) : (
        <div className="bg-white rounded-2xl premium-shadow border border-slate-100 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Registered On</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} onClick={() => onSelect(r)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">{r.studentName}</td>
                  <td className="px-4 py-3 text-slate-600 break-all">{r.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.phone}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.course}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); onSelect(r); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] text-[#0a0c28] hover:brightness-110 transition">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RegistrationDetail({ reg, onStatus, onDelete }: { reg: Registration; onStatus: (s: RegistrationStatus) => void; onDelete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <RegRow label="Student Name" value={reg.studentName} />
        <RegRow label="Parent / Guardian" value={reg.guardianName} />
        <RegRow label="Phone" value={<a href={`tel:${reg.phone}`} className="inline-flex items-center gap-1.5 hover:text-[#B8941F]"><Phone className="w-3.5 h-3.5" />{reg.phone}</a>} />
        <RegRow label="Email" value={reg.email ? <a href={`mailto:${reg.email}`} className="inline-flex items-center gap-1.5 hover:text-[#B8941F] break-all"><Mail className="w-3.5 h-3.5 shrink-0" />{reg.email}</a> : '—'} />
        <RegRow label="Course / Program" value={reg.course} />
        <RegRow label="School" value={reg.school || '—'} />
        <RegRow label="Registered On" value={new Date(reg.createdAt).toLocaleString()} />
        <RegRow label="Registration ID" value={reg.id} />
      </div>
      <RegRow label="Address" value={reg.address || '—'} />
      <RegRow label="Message" value={<span className="whitespace-pre-wrap">{reg.message || '—'}</span>} />
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</span>
        <StatusPill status={reg.status} />
      </div>
      <div className="flex gap-2 justify-end flex-wrap">
        <button onClick={() => { if (confirm('Delete this registration?')) onDelete(); }} className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100">
          <Trash2 className="w-4 h-4 inline mr-1" /> Delete
        </button>
        {reg.status !== 'rejected' && (
          <button onClick={() => onStatus('rejected')} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Reject
          </button>
        )}
        {reg.status !== 'approved' && (
          <button onClick={() => onStatus('approved')} className="px-5 py-2 rounded-xl text-sm font-bold gold-gradient text-[#0a0c28] shadow-lg hover:brightness-110 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Approve
          </button>
        )}
      </div>
    </div>
  );
}

function RegRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-semibold text-slate-800 text-sm">{value}</div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 items-center justify-center mb-4">{icon}</div>
      <h3 className="font-display font-bold text-lg text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden premium-shadow-lg flex flex-col"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0a0c28] to-[#1e2259] text-white">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function DoubtDetail({ item, answerText, setAnswerText, onSubmit, onDelete, typeLabel }: {
  item: Doubt;
  answerText: string;
  setAnswerText: (v: string) => void;
  onSubmit: () => void;
  onDelete: () => void;
  typeLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <InfoRow label="Student" value={item.studentName} />
        <InfoRow label="Subject" value={item.subject} />
        <InfoRow label="Submitted" value={new Date(item.createdAt).toLocaleString()} />
        <InfoRow label="Status" value={item.status === 'answered' ? 'Answered' : 'Pending'} />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Question</div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-slate-800 whitespace-pre-wrap">{item.question}</div>
      </div>
      {item.imageUrl && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Attached Image</div>
          <img src={item.imageUrl} alt="Question" className="rounded-xl border border-slate-200 max-h-64 object-contain bg-slate-50" />
        </div>
      )}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Teacher's Answer</div>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          rows={5}
          placeholder={`Type your ${typeLabel.toLowerCase()} response here… Student will see it instantly on their portal.`}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:outline-none text-sm resize-none"
        />
      </div>
      <div className="flex gap-2 justify-end flex-wrap">
        <button onClick={onDelete} className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100">
          <Trash2 className="w-4 h-4 inline mr-1" /> Delete
        </button>
        <button
          onClick={onSubmit}
          disabled={!answerText.trim()}
          className="px-5 py-2 rounded-xl text-sm font-bold gold-gradient text-[#0a0c28] shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {item.status === 'answered' ? 'Update Answer' : 'Answer & Resolve'}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-semibold text-slate-800 text-sm capitalize">{value}</div>
    </div>
  );
}
