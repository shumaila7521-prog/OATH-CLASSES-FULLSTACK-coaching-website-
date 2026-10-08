import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, X, CheckCircle2, Send } from 'lucide-react';
import { useStore, Registration } from '../lib/store';

/* Course / program options — same offerings as the Courses section */
const COURSE_OPTIONS = ['Class 9', 'Class 10', 'NMMS (MAT + SAT)', 'Foundation'];

interface FormState {
  studentName: string;
  guardianName: string;
  phone: string;
  email: string;
  course: string;
  school: string;
  address: string;
  message: string;
}

const EMPTY: FormState = {
  studentName: '',
  guardianName: '',
  phone: '',
  email: '',
  course: '',
  school: '',
  address: '',
  message: '',
};

type Errors = Partial<Record<keyof FormState, string>>;

const NAME_RE = /^[\p{L}\p{M}\s.'-]+$/u; // letters (incl. Hindi), spaces, . ' -
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts 10-digit Indian mobiles, optionally written with +91 / 0 and spaces or dashes. */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s\-()]/g, '');
  return digits.replace(/^(\+91|91|0)(?=\d{10}$)/, '');
}

function validate(f: FormState): Errors {
  const e: Errors = {};
  const name = f.studentName.trim();
  if (!name) e.studentName = 'Please enter the student’s name.';
  else if (name.length < 2 || !NAME_RE.test(name)) e.studentName = 'Enter a valid name (letters only).';

  const guardian = f.guardianName.trim();
  if (!guardian) e.guardianName = 'Please enter a parent / guardian name.';
  else if (guardian.length < 2 || !NAME_RE.test(guardian)) e.guardianName = 'Enter a valid name (letters only).';

  if (!f.phone.trim()) e.phone = 'Please enter a phone number.';
  else if (!/^[6-9]\d{9}$/.test(normalizePhone(f.phone))) e.phone = 'Enter a valid 10-digit mobile number.';

  if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address.';

  if (!f.course) e.course = 'Please select a course.';
  return e;
}

export default function EnrollModal({ onClose }: { onClose: () => void }) {
  const { addRegistration } = useStore();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<Registration | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (done || submitting) return; // guard against double submit
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      const rec = await addRegistration({
        studentName: form.studentName.trim(),
        guardianName: form.guardianName.trim(),
        phone: normalizePhone(form.phone),
        email: form.email.trim(),
        course: form.course,
        school: form.school.trim(),
        address: form.address.trim(),
        message: form.message.trim(),
      });
      setDone(rec);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (k: keyof FormState) => ({
    id: `enroll-${k}`,
    className: 'input',
    value: form[k],
    onChange: set(k),
    'aria-invalid': !!errors[k],
    'aria-describedby': errors[k] ? `enroll-${k}-err` : undefined,
  });
  const err = (k: keyof FormState) =>
    errors[k] ? <div id={`enroll-${k}-err`} className="text-xs text-red-600 mt-1">{errors[k]}</div> : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        role="dialog"
        aria-modal="true"
        aria-label="Student Registration"
        className="relative bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 premium-shadow-lg"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {done ? (
          <div className="text-center py-4">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display font-black text-2xl text-[#0F2449]">Registration Successful!</h3>
            <p className="text-sm text-slate-600 mt-2">
              Thank you, <strong>{done.studentName}</strong>. We have received your registration for <strong>{done.course}</strong>.
              Our team will contact you soon on <strong>{done.phone}</strong>.
            </p>
            <div className="mt-4 inline-block text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
              Registration ID: <code className="font-bold text-navy-700">{done.id}</code>
            </div>
            <div className="mt-6">
              <button type="button" onClick={onClose} className="btn-primary justify-center">Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="inline-flex w-14 h-14 rounded-2xl navy-gradient text-[#D4AF37] items-center justify-center mb-3">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="font-display font-black text-2xl text-[#0F2449]">Student Registration</h3>
              <p className="text-sm text-slate-500 mt-1">Fill in the details below to reserve your seat at OATH CLASSES.</p>
            </div>

            <form onSubmit={submit} noValidate className="space-y-3">
              <div>
                <label className="label" htmlFor="enroll-studentName">Student Name *</label>
                <input {...field('studentName')} placeholder="e.g. Aarav Sharma" autoFocus autoComplete="name" />
                {err('studentName')}
              </div>
              <div>
                <label className="label" htmlFor="enroll-guardianName">Parent / Guardian Name *</label>
                <input {...field('guardianName')} placeholder="e.g. Rajesh Sharma" />
                {err('guardianName')}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="enroll-phone">Phone Number *</label>
                  <input {...field('phone')} type="tel" inputMode="tel" placeholder="10-digit mobile" autoComplete="tel" />
                  {err('phone')}
                </div>
                <div>
                  <label className="label" htmlFor="enroll-email">Email</label>
                  <input {...field('email')} type="email" placeholder="Optional" autoComplete="email" />
                  {err('email')}
                </div>
              </div>
              <div>
                <label className="label" htmlFor="enroll-course">Course / Program *</label>
                <select {...field('course')}>
                  <option value="">Select a course</option>
                  {COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {err('course')}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="enroll-school">School Name</label>
                  <input {...field('school')} placeholder="Optional" />
                </div>
                <div>
                  <label className="label" htmlFor="enroll-address">Address</label>
                  <input {...field('address')} placeholder="Optional" autoComplete="street-address" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="enroll-message">Message</label>
                <textarea {...field('message')} rows={2} placeholder="Anything you’d like us to know (optional)" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={onClose} disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary justify-center disabled:opacity-70">
                  <Send className="w-4 h-4" /> {submitting ? 'Submitting…' : 'Register'}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
