import React, { useState } from 'react';
import * as api from '../services/api';
import { Button, Field, Input, Logo } from './ui';

export default function Login({ onLogin }: { onLogin: (u: { name: string; role: string }) => void }) {
  const [role, setRole] = useState<'admin' | 'teacher'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) err.email = 'Enter a valid email address';
    if (password.length < 6) err.password = 'Password must be at least 6 characters';
    setErrors(err);
    if (Object.keys(err).length) return;

    setStatus('loading'); setMsg('');
    try {
      const res: any = role === 'admin' ? await api.adminLogin(email, password) : await api.teacherLogin(email, password);
      sessionStorage.setItem('oath_admin_token', res.token); // session token only
      onLogin({ name: res.name ?? (role === 'admin' ? 'Admin' : 'Teacher'), role });
    } catch (e: any) {
      setStatus('error'); setMsg(e.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0C2440] p-4"
      style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #1c4570 0%, #0C2440 55%)' }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={72} />
          <h1 className="mt-3 text-2xl font-bold tracking-wide text-[#12304F]">OATH CLASSES</h1>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">NMMS | MAT | SAT | FOUNDATION</p>
          <p className="mt-2 text-sm text-slate-500">Admin Panel Login</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          {(['admin', 'teacher'] as const).map((r) => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`rounded-md py-2 text-sm font-semibold capitalize transition ${role === r ? 'bg-white text-[#12304F] shadow' : 'text-slate-500'}`}>
              {r} Login
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <Field label="Email"><Input type="email" value={email} placeholder={`${role}@oathclasses.in`} onChange={(e) => setEmail(e.target.value)} /></Field>
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>
          <div>
            <Field label="Password"><Input type="password" value={password} placeholder="••••••" onChange={(e) => setPassword(e.target.value)} /></Field>
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
          </div>
          {status === 'error' && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{msg}</p>}
          <Button type="submit" className="w-full justify-center py-2.5" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : `Sign in as ${role}`}
          </Button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-400">
          Authentication UI only — connect real auth APIs via <code>VITE_API_BASE_URL</code>.
        </p>
      </div>
    </div>
  );
}
