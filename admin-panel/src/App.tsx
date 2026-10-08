import { useEffect, useState } from 'react';
import * as api from './services/api';
import Login from './admin/Login';
import { Logo, Toast } from './admin/ui';
import { Batches, Courses, Dashboard, Registrations, Students, Teachers } from './admin/pages/Core';
import { Announcements, Doubts, Notes, QnA, QuestionBank, QuestionPapers, Results, Tests } from './admin/pages/Academics';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'students', label: 'Students', icon: '🎓' },
  { key: 'registrations', label: 'Registrations', icon: '📝' },
  { key: 'teachers', label: 'Teachers', icon: '👩‍🏫' },
  { key: 'courses', label: 'Courses', icon: '📚' },
  { key: 'batches', label: 'Batches', icon: '🗂️' },
  { key: 'notes', label: 'Notes', icon: '📄' },
  { key: 'tests', label: 'Tests', icon: '🧪' },
  { key: 'question-bank', label: 'Question Bank', icon: '🗃️' },
  { key: 'results', label: 'Results', icon: '🏆' },
  { key: 'question-papers', label: 'Question Papers', icon: '📑' },
  { key: 'doubts', label: 'Doubts', icon: '❓' },
  { key: 'qna', label: 'Q&A', icon: '💬' },
  { key: 'announcements', label: 'Announcements', icon: '📢' },
];

export default function App() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [page, setPage] = useState('dashboard');
  const [open, setOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toast = (m: string) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2500); };

  useEffect(() => { document.title = 'Oath Classes — Admin Panel'; }, []);

  // Real backend errors (see services/api.ts) -> visible toast; expired/invalid token -> back to login.
  useEffect(() => {
    const onErr = (e: Event) => toast(String((e as CustomEvent).detail || 'Request failed'));
    const onAuth = () => {
      sessionStorage.removeItem('oath_admin_token');
      setUser(null); setPage('dashboard');
      toast('Session expired — please sign in again');
    };
    window.addEventListener('oath-api-error', onErr);
    window.addEventListener('oath-auth-expired', onAuth);
    return () => {
      window.removeEventListener('oath-api-error', onErr);
      window.removeEventListener('oath-auth-expired', onAuth);
    };
  }, []);

  if (!user) return <Login onLogin={setUser} />;

  const render = () => {
    switch (page) {
      case 'students': return <Students />;
      case 'registrations': return <Registrations toast={toast} />;
      case 'teachers': return <Teachers toast={toast} />;
      case 'courses': return <Courses toast={toast} />;
      case 'batches': return <Batches toast={toast} />;
      case 'notes': return <Notes toast={toast} />;
      case 'tests': return <Tests toast={toast} />;
      case 'question-bank': return <QuestionBank toast={toast} />;
      case 'results': return <Results toast={toast} />;
      case 'question-papers': return <QuestionPapers toast={toast} />;
      case 'doubts': return <Doubts toast={toast} />;
      case 'qna': return <QnA toast={toast} />;
      case 'announcements': return <Announcements toast={toast} />;
      default: return <Dashboard go={setPage} />;
    }
  };

  const logout = async () => {
    try { await api.logout(); } catch { /* ignore */ }
    sessionStorage.removeItem('oath_admin_token');
    setUser(null); setPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-auto bg-[#0C2440] text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Logo size={40} />
          <div>
            <p className="text-sm font-bold tracking-wide">OATH CLASSES</p>
            <p className="text-[10px] tracking-[0.15em] text-white/50">ADMIN PANEL</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => { setPage(n.key); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${page === n.key ? 'bg-white/15 font-semibold text-white' : 'text-white/70 hover:bg-white/10'}`}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div className="p-3">
          <button onClick={logout} className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
            ⎋ Logout
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-slate-300 px-2 py-1 lg:hidden" onClick={() => setOpen(true)}>☰</button>
            <p className="text-sm font-semibold capitalize text-[#12304F]">{NAV.find((n) => n.key === page)?.label}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 sm:inline">NMMS | MAT | SAT | Foundation</span>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#12304F] text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-medium capitalize">{user.role}</span>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">{render()}</main>
      </div>
      <Toast msg={toastMsg} />
    </div>
  );
}
