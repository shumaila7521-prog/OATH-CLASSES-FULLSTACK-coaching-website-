import React from 'react';

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
      <circle cx="50" cy="50" r="49" fill="#F7EFDF" />
      <path d="M50 20 L70 28 V50 C70 63 61 72 50 78 C39 72 30 63 30 50 V28 Z" fill="none" stroke="#12304F" strokeWidth="4" />
      <text x="50" y="59" textAnchor="middle" fontSize="28" fontFamily="Georgia, serif" fontWeight="bold" fill="#12304F">O</text>
      <path d="M26 42 C18 50 20 62 28 68" fill="none" stroke="#12304F" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M74 42 C82 50 80 62 72 68" fill="none" stroke="#12304F" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M28 68 L50 82 L72 68" fill="none" stroke="#12304F" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-[#12304F]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Button({
  children, variant = 'primary', className = '', ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'success' | 'soft' }) {
  const v: Record<string, string> = {
    primary: 'bg-[#12304F] text-white hover:bg-[#1c4570]',
    soft: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    ghost: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${v[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const tone =
    ['approved', 'active', 'enrolled', 'answered', 'published', 'running'].includes(s) ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : ['pending', 'upcoming', 'on leave', 'draft', 'unpublished'].includes(s) ? 'bg-amber-50 text-amber-700 ring-amber-200'
    : ['rejected', 'inactive'].includes(s) ? 'bg-rose-50 text-rose-700 ring-rose-200'
    : 'bg-slate-100 text-slate-600 ring-slate-200';
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ${tone}`}>{status}</span>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#12304F] focus:ring-2 focus:ring-[#12304F]/15';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className={`mt-10 w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} rounded-xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="font-semibold text-[#12304F]">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#12304F]" />
      Loading data…
    </div>
  );
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[60] rounded-lg bg-[#12304F] px-4 py-3 text-sm text-white shadow-lg">
      {msg}
    </div>
  );
}

/** Generic data-fetch hook — swap mock for API by flipping VITE_USE_MOCK. */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    let live = true;
    setLoading(true);
    fn()
      .then((d) => live && (setData(d), setError(null)))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, setData, loading, error };
}
