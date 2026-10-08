import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  BookOpen, Users, Target, MessageCircle, Trophy, ClipboardCheck, NotebookPen,
  TrendingUp, Clock, UsersRound, GraduationCap, Calculator, FlaskConical,
  BookText, Globe2, Phone, MapPin, Sparkles, CheckCircle2, Clock as ClockIcon,
  Search, Send, Image as ImageIcon, X, Calendar, Shield, Award,
  ChevronRight, Star, PlayCircle, Download, Lock, User, HelpCircle,
  FileText, Eye, FolderOpen, BookMarked, FileDown, PlusCircle, Trash2,
  Sun, Moon, Megaphone,
} from 'lucide-react';
import Logo from './Logo';
import {
  INSTITUTE, FEATURES, FACILITIES, NMMS_FEATURES, NMMS_STATS, NMMS_TOTAL,
  NMMS_TAGLINE, NMMS_HINDI_MID, NMMS_BOTTOM_QUOTE,
  useStore, Subject, ALL_SUBJECTS, Doubt, QAItem,
} from '../lib/store';
import { useTheme } from '../lib/theme';
import { fetchNotes, fetchPapers, fetchTests, fetchAnnouncements, fileUrl, type PublicNote, type PublicPaper, type PublicTest, type PublicAnnouncement } from '../lib/api';

/* =========================================================
   Utility: animated counter
   ========================================================= */
function Counter({ to, duration = 1800, suffix = '' }: { to: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* =========================================================
   Reveal wrapper for scroll animations
   ========================================================= */
function Reveal({ children, delay = 0, y = 24, className = '' }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   Animated hero background: floating formulas, books, particles
   ========================================================= */
function HeroBackground() {
  const symbols = useMemo(() => {
    const formulas = ['∑', 'π', '∫', '√', '∞', 'θ', 'Δ', '±', '÷', '×', 'x²', 'H₂O', 'E=mc²', 'f(x)', 'a²+b²', 'πr²', 'C₆H₁₂', 'F=ma', '≈', '≠'];
    return formulas.map((f, i) => ({
      id: i,
      char: f,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 8 + Math.random() * 10,
      size: 20 + Math.random() * 44,
    }));
  }, []);
  const particles = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 3 + Math.random() * 6,
      duration: 14 + Math.random() * 12,
      delay: Math.random() * 14,
    })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient base */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 10%, rgba(212,175,55,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(59, 79, 160, 0.3) 0%, transparent 50%), linear-gradient(135deg, #05061a 0%, #0a0c28 50%, #1e2259 100%)',
      }} />
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      {/* Floating formulas */}
      {symbols.map((s) => (
        <div
          key={s.id}
          className="absolute font-display font-bold select-none animate-float-slow"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: s.size,
            color: 'rgba(255,255,255,0.06)',
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          {s.char}
        </div>
      ))}
      {/* Gold particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      {/* Soft vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,26,0.7) 100%)',
      }} />
    </div>
  );
}

/* =========================================================
   NAVBAR
   ========================================================= */
export function Navbar({ onEnrollClick }: { onEnrollClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    // Track active section
    const sections = ['home', 'about', 'mentor', 'courses', 'features', 'nmms', 'study', 'tests', 'parents', 'doubts', 'qa', 'toppers', 'contact'];
    const onActive = () => {
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActive(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', onActive);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onActive);
    };
  }, []);

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'features', label: 'Why Us' },
    { id: 'nmms', label: 'NMMS' },
    { id: 'study', label: 'Study Material' },
    { id: 'tests', label: 'Tests' },
    { id: 'doubts', label: 'Doubts' },
    { id: 'qa', label: 'Q&A' },
    { id: 'toppers', label: 'Toppers' },
    { id: 'contact', label: 'Contact' },
  ];

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-[#0b1020]/90 backdrop-blur-xl shadow-lg py-2 border-b border-[var(--color-border)]'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          <button onClick={() => go('home')} className="flex items-center gap-3 group">
            <Logo size={scrolled ? 44 : 54} showText={!scrolled ? false : false} />
            <div className="hidden sm:block leading-tight">
              <div className={`font-display font-black tracking-tight transition-colors ${scrolled ? 'text-[var(--color-ink)]' : 'text-white'} text-xl md:text-2xl`}>
                OATH <span className="text-[#D4AF37]">CLASSES</span>
              </div>
              {!scrolled && (
                <div className="text-[10px] font-semibold tracking-[0.25em] text-white/70 uppercase">Concept • Marks • Success</div>
              )}
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className={`relative px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                  active === l.id
                    ? scrolled
                      ? 'text-[var(--color-primary)] dark:text-[var(--color-gold-400)]'
                      : 'text-[#D4AF37]'
                    : scrolled
                      ? 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] dark:hover:text-white'
                      : 'text-white/80 hover:text-white'
                }`}
              >
                {l.label}
                {active === l.id && (
                  <motion.span
                    layoutId="activeNav"
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full ${scrolled ? 'bg-[#D4AF37]' : 'bg-[#D4AF37]'}`}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle scrolled={scrolled} />
            <button
              onClick={onEnrollClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold gold-gradient text-[#0a0c28] shadow-lg hover:brightness-110 transition"
            >
              <Phone className="w-3.5 h-3.5" /> Enroll Now
            </button>
            <button onClick={() => setOpen(!open)} className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-[var(--color-ink)]' : 'text-white'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                {open ? <><path d="M6 6l12 12"/><path d="M18 6l-12 12"/></> : <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>}
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[64px] z-40 lg:hidden bg-white dark:bg-[#10152a] border-b border-[var(--color-border)] shadow-xl p-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <button key={l.id} onClick={() => go(l.id)} className="text-left px-4 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-navy-50 dark:hover:bg-white/5 hover:text-navy-700 dark:hover:text-[var(--color-gold-400)] flex items-center justify-between">
                  {l.label}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
              <button onClick={() => { setOpen(false); onEnrollClick(); }} className="mt-2 px-4 py-3 rounded-xl font-bold gold-gradient text-[#0a0c28] flex items-center gap-2 justify-center">
                <Phone className="w-4 h-4" /> Enroll Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Theme toggle button (sun/moon) */
function ThemeToggle({ scrolled }: { scrolled: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const onHero = !scrolled;
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all overflow-hidden ${
        onHero
          ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
          : 'bg-[var(--color-bg-soft)] border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-gold-600)] dark:hover:text-[var(--color-gold-400)]'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          {isDark ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/* =========================================================
   HERO
   ========================================================= */
export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      <HeroBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs md:text-sm font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-hindi">{INSTITUTE.hindiTopRight}</span>
          </motion.div>

          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 180 }} className="flex items-center gap-4 mb-6">
            <div className="bg-white rounded-full p-1 premium-shadow-lg">
              <Logo size={72} showText={false} />
            </div>
            <div>
              <h1 className="font-display font-black text-5xl md:text-7xl leading-none tracking-tight">
                OATH
              </h1>
              <div className="font-display font-bold text-3xl md:text-5xl gold-text tracking-widest leading-none">
                CLASSES
              </div>
            </div>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-sm md:text-base text-white/80 font-semibold tracking-[0.3em] uppercase mb-2">
            {INSTITUTE.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 space-y-4"
          >
            <div className="inline-block">
              <div className="text-2xl md:text-4xl font-display font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {INSTITUTE.classes}
              </div>
              <div className="mt-1">
                <span className="font-display font-black text-4xl md:text-7xl leading-none text-[#D4AF37] drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                  ADMISSION
                </span>
                <span className="block font-display font-black text-5xl md:text-8xl leading-none text-white mt-1">
                  OPEN
                </span>
              </div>
            </div>

            <p className="font-hindi text-lg md:text-2xl text-white font-semibold text-[#f0d77b]">
              {INSTITUTE.hindiSubheadline}
            </p>
          </motion.div>

          {/* Subjects pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-2 mt-6"
          >
            {[
              { s: 'Mathematics', icon: <Calculator className="w-4 h-4" /> },
              { s: 'Science', icon: <FlaskConical className="w-4 h-4" /> },
              { s: 'English', icon: <BookText className="w-4 h-4" /> },
              { s: 'Social Science', icon: <Globe2 className="w-4 h-4" /> },
            ].map(({ s, icon }) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-white/10 border border-white/20 text-white backdrop-blur-sm">
                {icon} {s}
              </span>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-wrap gap-3 mt-8"
          >
            <a href={`tel:${INSTITUTE.phone1}`} className="btn-primary">
              <Phone className="w-4 h-4" /> Call for Admission
            </a>
            <button onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary">
              <BookOpen className="w-4 h-4" /> Explore Courses
            </button>
          </motion.div>

          {/* Limited seats ribbon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-400/40 text-red-100 text-xs md:text-sm font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            {INSTITUTE.limitedSeats}
          </motion.div>
        </div>

        {/* Right: Premium card stack with teacher/visual */}
        <div className="lg:col-span-5 relative hidden md:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="relative aspect-[4/5] max-w-md mx-auto"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/30 via-transparent to-[#2b2f77]/40 rounded-[2.5rem] blur-2xl" />
            {/* Gold border glow card */}
            <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden premium-shadow-lg gold-border-glow bg-gradient-to-br from-[#1e2259] to-[#0a0c28]">
              <TeacherPhoto />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c28] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-center gap-2 mb-1 text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase">
                  <GraduationCap className="w-4 h-4" /> Our Mentor
                </div>
                <div className="font-display font-black text-2xl leading-tight">Experienced & Dedicated Faculty</div>
                <div className="text-white/70 text-sm mt-1 font-hindi">अनुभवी एवं समर्पित शिक्षक</div>
              </div>
            </div>
            {/* Floating badge top right */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 w-28 h-28 rounded-full gold-gradient flex flex-col items-center justify-center text-[#0a0c28] premium-shadow-lg border-4 border-white"
            >
              <Trophy className="w-7 h-7 mb-0.5" />
              <div className="text-[10px] font-black uppercase tracking-wider leading-tight text-center">NMMS<br/>Success</div>
              <div className="font-display font-black text-xl leading-none">11+</div>
            </motion.div>
            {/* Floating card bottom left */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-3 premium-shadow-lg flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Classes</div>
                <div className="font-display font-black text-lg text-[#0F2449] leading-none">9 & 10</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-1 text-[10px] tracking-[0.3em] font-bold uppercase"
      >
        <span>Scroll</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-white/60 to-transparent" />
      </motion.div>
    </section>
  );
}

/* =========================================================
   ABOUT / PROMISE strip
   ========================================================= */
export function AboutStrip() {
  return (
    <section id="about" className="relative bg-cream py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-xs tracking-[0.4em] uppercase mb-3">
            <span className="h-px w-8 bg-[#D4AF37]" /> Our Promise <span className="h-px w-8 bg-[#D4AF37]" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display font-black text-3xl md:text-5xl text-[#0F2449] leading-tight">
            {INSTITUTE.aajKiTaiyari}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-4 font-hindi text-lg md:text-xl text-slate-700 max-w-3xl mx-auto">
            {INSTITUTE.bottomHindi}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================
   TEACHER / MENTOR
   ========================================================= */
export function MentorSection() {
  return (
    <section id="mentor" className="relative section-padding bg-gradient-to-b from-white to-cream">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#D4AF37] via-[#1e2259] to-[#0a0c28] blur-2xl opacity-20" />
              <div className="relative rounded-[2rem] overflow-hidden premium-shadow-lg gold-border-glow">
                <TeacherPhoto largeLabel />
              </div>
              {/* Accent card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 premium-shadow-lg border border-[#D4AF37]/30 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8932a] text-[#0a0c28] flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-display font-black text-[#0F2449]">Guiding Excellence</div>
                    <div className="text-xs text-slate-500">Concepts • Results • Success</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-xs tracking-[0.4em] uppercase mb-3">
                <span className="h-px w-8 bg-[#D4AF37]" /> Meet Your Mentor <span className="h-px w-8 bg-[#D4AF37]" />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display font-black text-3xl md:text-5xl text-[#0F2449] leading-tight">
                Learn from a Teacher who <span className="gold-text">cares about your results</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 text-slate-600 leading-relaxed">
                At OATH CLASSES, teaching is not just a job — it's a commitment to your success.
                Our mentor personally designs every lesson to ensure concept clarity, regular
                practice, and steady improvement — so that every student moves confidently towards
                board exams and scholarship success.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="grid sm:grid-cols-2 gap-3 mt-6">
                {[
                  { icon: <GraduationCap className="w-4 h-4" />, text: 'Experienced guidance' },
                  { icon: <Target className="w-4 h-4" />, text: 'Exam-oriented teaching' },
                  { icon: <MessageCircle className="w-4 h-4" />, text: 'Doubt sessions & personal guidance' },
                  { icon: <TrendingUp className="w-4 h-4" />, text: 'Performance analysis & reports' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 premium-shadow border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-700 flex items-center justify-center shrink-0">{b.icon}</div>
                    <span className="text-sm font-semibold text-slate-700">{b.text}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => document.getElementById('doubts')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary">
                  <MessageCircle className="w-4 h-4" /> Ask a Doubt
                </button>
                <a href={`tel:${INSTITUTE.phone1}`} className="btn-ghost">
                  <Phone className="w-4 h-4" /> Talk to Teacher
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Teacher photo component with fallback */
function TeacherPhoto({ largeLabel = false }: { largeLabel?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#1e2259] to-[#0a0c28] aspect-[4/5] md:aspect-auto md:h-full min-h-[300px]">
      {!failed ? (
        <img
          src="/images/teacher.jpg"
          alt="OATH Classes Teacher"
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/70">
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#2b2f77] to-[#0a0c28] flex items-center justify-center border-4 border-[#D4AF37]/30 mb-3">
              <User className="w-12 h-12 text-[#D4AF37]" />
            </div>
            <div className="font-hindi text-sm">Teacher photo placeholder</div>
            <div className="text-[11px] text-white/50 mt-1">Add /images/teacher.jpg to display</div>
          </div>
        </div>
      )}
      {largeLabel && (
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass-dark text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase">
          Faculty
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COURSES / CLASSES
   ========================================================= */
export function CoursesSection() {
  const courses = [
    {
      title: 'Class 9',
      subtitle: 'Foundation & Concepts',
      desc: 'Strong foundational preparation for CBSE / State Board exams with NCERT-based study, regular tests, and personal doubt guidance.',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600',
      subjects: ['Mathematics', 'Science', 'English', 'Social Science'],
    },
    {
      title: 'Class 10',
      subtitle: 'Board Exam Mastery',
      desc: 'Complete board exam preparation with 100% exam-oriented teaching, chapter-wise notes, performance analysis, and parent feedback.',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'from-crimson-500 to-red-700',
      subjects: ['Mathematics', 'Science', 'English', 'Social Science'],
      badge: 'Board Exams',
    },
    {
      title: 'NMMS',
      subtitle: 'Scholarship Exam (MAT + SAT)',
      desc: 'Comprehensive NMMS preparation including MAT and SAT, weekly tests, excellent study material, and proven selection results (2 in 2025, 9 in 2026).',
      icon: <Trophy className="w-6 h-6" />,
      color: 'from-amber-500 to-yellow-600',
      subjects: ['MAT', 'SAT', 'Mental Ability', 'Scholastic Aptitude'],
      badge: 'New Batch 2027',
    },
    {
      title: 'Foundation',
      subtitle: 'MAT | SAT | Foundation',
      desc: 'Build a strong academic base for future competitive exams with experienced guidance, personal attention, and progress reports.',
      icon: <Award className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-600',
      subjects: ['Mathematics', 'Science', 'Reasoning', 'General Awareness'],
    },
  ];

  return (
    <section id="courses" className="section-padding bg-white relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          kicker="Our Courses"
          title="Programs designed for real results"
          subtitle={`OATH CLASSES runs specialised batches for ${INSTITUTE.classes} and for NMMS scholarship aspirants.`}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {courses.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="group relative h-full bg-white rounded-3xl p-6 premium-shadow border border-slate-100 hover:border-[#D4AF37]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl overflow-hidden">
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${c.color} opacity-10 group-hover:opacity-20 transition-opacity blur-xl`} />
                {c.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-black px-2 py-1 rounded-full bg-red-500 text-white tracking-wider">
                    {c.badge}
                  </span>
                )}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  {c.icon}
                </div>
                <h3 className="font-display font-black text-2xl text-[#0F2449]">{c.title}</h3>
                <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">{c.subtitle}</div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{c.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.subjects.map((s) => (
                    <span key={s} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-navy-50 text-navy-700">{s}</span>
                  ))}
                </div>
                <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-1 text-sm font-bold text-[#0F2449] group-hover:text-[#D4AF37] transition-colors">
                  Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FEATURES
   ========================================================= */
function featIcon(name: string) {
  const map: Record<string, React.ReactNode> = {
    'users-teacher': <UsersRound className="w-6 h-6" />,
    'book-open': <BookOpen className="w-6 h-6" />,
    'target': <Target className="w-6 h-6" />,
    'messages': <MessageCircle className="w-6 h-6" />,
    'trophy': <Trophy className="w-6 h-6" />,
    'clipboard': <ClipboardCheck className="w-6 h-6" />,
    'notebook': <NotebookPen className="w-6 h-6" />,
    'chart': <TrendingUp className="w-6 h-6" />,
    'clock': <Clock className="w-6 h-6" />,
    'users': <Users className="w-6 h-6" />,
    'user-graduate': <GraduationCap className="w-6 h-6" />,
    'clipboard-check': <ClipboardCheck className="w-6 h-6" />,
    'books-stack': <BookOpen className="w-6 h-6" />,
    'id-card': <User className="w-6 h-6" />,
  };
  return map[name] ?? <Star className="w-6 h-6" />;
}

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-cream relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-[#1e2259]/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          kicker="हमारी विशेषताएँ"
          title="Why Students & Parents choose OATH"
          subtitle="Six pillars that define how we teach, mentor, and deliver real results."
          center
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="h-full bg-white rounded-2xl p-6 premium-shadow border border-slate-100 hover:border-[#D4AF37]/40 hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl gold-gradient text-[#0a0c28] flex items-center justify-center shadow mb-4">
                  {featIcon(f.icon)}
                </div>
                <h3 className="font-display font-bold text-lg text-[#0F2449] leading-tight font-hindi">{f.title}</h3>
                {f.hindi && <p className="font-hindi text-sm text-slate-500 mt-1">{f.hindi}</p>}
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{f.english}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Additional facilities grid */}
        <div className="mt-12 bg-gradient-to-br from-[#0a0c28] to-[#1e2259] rounded-3xl p-6 md:p-10 premium-shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl" />
          <div className="relative text-white">
            <Reveal>
              <h3 className="font-display font-black text-2xl md:text-3xl mb-1">
                हम क्या उपलब्ध कराते हैं?
              </h3>
              <p className="text-white/70 text-sm md:text-base mb-8">Everything a student needs to succeed — inside and outside the classroom.</p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FACILITIES.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.05}>
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-[#D4AF37]/40 transition">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mb-2">
                      {featIcon(f.icon)}
                    </div>
                    <div className="font-bold font-hindi text-sm md:text-base">{f.title}</div>
                    <div className="text-[11px] text-white/60 mt-0.5">{f.english}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   NMMS SUCCESS
   ========================================================= */
export function NMMSSection() {
  return (
    <section id="nmms" className="section-padding relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0a0c28 0%, #1e2259 50%, #0a0c28 100%)',
    }}>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, #D4AF37 1px, transparent 1px), radial-gradient(circle at 80% 70%, #D4AF37 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-white">
        <div className="text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-xs tracking-[0.4em] uppercase mb-3">
              <Trophy className="w-4 h-4" /> Scholarship Success <Trophy className="w-4 h-4" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display font-black text-4xl md:text-6xl leading-none">
              <span className="text-white">NMMS</span>{' '}
              <span className="gold-text">2027</span>
            </h2>
            <div className="mt-2 font-display font-black text-2xl md:text-5xl text-white">NEW BATCH</div>
            <div className="mt-1 font-hindi text-[#D4AF37] font-bold text-lg md:text-2xl">Starting Soon</div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-3 font-hindi text-white/80 text-base md:text-lg">{NMMS_TAGLINE}</p>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 items-stretch">
          {NMMS_STATS.map((s, i) => (
            <Reveal key={s.year} delay={i * 0.1}>
              <div className="relative h-full bg-gradient-to-br from-[#1e2259] to-[#0a0c28] rounded-3xl p-6 md:p-8 border border-[#D4AF37]/30 premium-shadow text-center overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 gold-gradient" />
                <div className="flex justify-center mb-3">
                  <svg width="180" height="50" viewBox="0 0 180 50" className="text-[#D4AF37]">
                    <path d="M10 25 Q 25 0 45 25" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M135 25 Q 155 0 170 25" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <div className="font-display font-black text-5xl md:text-7xl gold-text leading-none">
                  <Counter to={s.count} />
                </div>
                <div className="mt-2 font-hindi text-lg font-bold text-white">{s.label}</div>
                <div className="text-[11px] tracking-[0.3em] font-bold text-[#D4AF37] mt-1 uppercase">{s.year}</div>
                <div className="mt-3 text-sm text-white/70">{s.count} {s.labelEn}</div>
              </div>
            </Reveal>
          ))}
          {/* Total */}
          <Reveal delay={0.25}>
            <div className="relative h-full gold-gradient rounded-3xl p-6 md:p-8 text-[#0a0c28] premium-shadow-lg overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/30 rounded-full blur-2xl" />
              <div className="relative text-center">
                <div className="inline-flex w-14 h-14 rounded-full bg-[#0a0c28] text-[#D4AF37] items-center justify-center mb-3">
                  <Trophy className="w-7 h-7" />
                </div>
                <div className="font-display font-black text-5xl md:text-7xl leading-none">
                  <Counter to={NMMS_TOTAL} />
                </div>
                <div className="mt-2 font-hindi font-black text-lg">कुल विद्यार्थियों का चयन</div>
                <div className="font-hindi text-sm mt-2 font-semibold">{NMMS_HINDI_MID}</div>
                <div className="mt-2 text-xs font-bold tracking-widest uppercase">Total Selections</div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {NMMS_FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="bg-white/5 backdrop-blur rounded-2xl p-4 border border-white/10 hover:border-[#D4AF37]/40 transition flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gold-gradient text-[#0a0c28] flex items-center justify-center shrink-0 shadow-lg">
                  {featIcon(f.icon)}
                </div>
                <div>
                  <div className="font-hindi font-bold text-white text-sm md:text-base">{f.title}</div>
                  <div className="text-[11px] text-white/60 mt-0.5">{f.english}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-12 text-center">
            <p className="font-hindi text-lg md:text-2xl font-bold text-[#f0d77b] mb-4">{NMMS_BOTTOM_QUOTE}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href={`tel:${INSTITUTE.phone1}`} className="btn-primary">
                <Phone className="w-4 h-4" /> Enroll for NMMS 2027
              </a>
              <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary">
                <MapPin className="w-4 h-4" /> Visit Institute
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================
   STUDY MATERIAL
   ========================================================= */
type MaterialCategory = 'all' | 'notes' | 'pdf' | 'practice' | 'previous' | 'tests';

interface MaterialResource {
  id: string;
  title: string;
  subject: string;
  category: Exclude<MaterialCategory, 'all'>;
  pages?: number;
  chapters?: string;
  type: 'PDF' | 'NOTES' | 'SET' | 'PAPER';
  size?: string;
  forClass?: string;
  file?: string;
}


const materialFromNote = (n: PublicNote): MaterialResource => ({
  id: n.id,
  title: n.title,
  subject: n.subject || n.course || 'General',
  category: 'notes',
  chapters: n.chapter || n.topic,
  type: 'NOTES',
  forClass: n.batch || n.course,
  file: n.file,
});

const materialFromPaper = (p: PublicPaper): MaterialResource => ({
  id: p.id,
  title: p.title,
  subject: p.subject || p.course || 'General',
  category: 'previous',
  type: 'PAPER',
  chapters: p.examDate ? `Exam: ${p.examDate}` : undefined,
  forClass: p.batch || p.course,
  file: p.file,
});

const CATEGORIES: { id: MaterialCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Resources', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'notes', label: 'Notes', icon: <BookMarked className="w-4 h-4" /> },
  { id: 'pdf', label: 'PDFs', icon: <FileText className="w-4 h-4" /> },
  { id: 'practice', label: 'Practice Sets', icon: <NotebookPen className="w-4 h-4" /> },
  { id: 'previous', label: 'Previous Papers', icon: <FileDown className="w-4 h-4" /> },
  { id: 'tests', label: 'Test Material', icon: <ClipboardCheck className="w-4 h-4" /> },
];

const SUBJECT_GROUPS: { name: string; icon: React.ReactNode; color: string; gradient: string }[] = [
  { name: 'Mathematics', icon: <Calculator className="w-5 h-5" />, color: 'text-blue-600', gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Science', icon: <FlaskConical className="w-5 h-5" />, color: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'English', icon: <BookText className="w-5 h-5" />, color: 'text-rose-600', gradient: 'from-rose-500 to-pink-600' },
  { name: 'Social Science', icon: <Globe2 className="w-5 h-5" />, color: 'text-amber-600', gradient: 'from-amber-500 to-orange-600' },
  { name: 'NMMS MAT', icon: <Target className="w-5 h-5" />, color: 'text-violet-600', gradient: 'from-violet-500 to-purple-600' },
  { name: 'NMMS SAT', icon: <GraduationCap className="w-5 h-5" />, color: 'text-sky-600', gradient: 'from-sky-500 to-cyan-600' },
];

function TypeBadge({ type }: { type: MaterialResource['type'] }) {
  const styles: Record<MaterialResource['type'], string> = {
    PDF: 'bg-red-50 text-red-700 border-red-200',
    NOTES: 'bg-blue-50 text-blue-700 border-blue-200',
    SET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PAPER: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${styles[type]}`}>{type}</span>;
}

export function StudyMaterialSection() {
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>('all');
  const [activeSubject, setActiveSubject] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqSubject, setReqSubject] = useState<string>('Mathematics');
  const [reqTopic, setReqTopic] = useState('');
  const [reqSent, setReqSent] = useState(false);
  const [materials, setMaterials] = useState<MaterialResource[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchNotes(), fetchPapers()])
      .then(([notes, papers]) => {
        if (!active) return;
        setMaterials([
          ...notes.map(materialFromNote),
          ...papers.map(materialFromPaper),
        ]);
      })
      .catch(() => {
        if (active) setMaterials([]);
      })
      .finally(() => {
        if (active) setLoadingMaterials(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    return materials.filter((m) => activeCategory === 'all' || m.category === activeCategory)
      .filter((m) => activeSubject === 'all' || m.subject === activeSubject)
      .filter((m) => !search || m.title.toLowerCase().includes(search.toLowerCase()) || (m.chapters ?? '').toLowerCase().includes(search.toLowerCase()));
  }, [materials, activeCategory, activeSubject, search]);

  const totalBySubject = useMemo(() => {
    const counts: Record<string, number> = {};
    materials.forEach((m) => { counts[m.subject] = (counts[m.subject] ?? 0) + 1; });
    return counts;
  }, [materials]);

  const totalByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    materials.forEach((m) => { counts[m.category] = (counts[m.category] ?? 0) + 1; });
    return counts;
  }, [materials]);

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqTopic.trim()) return;
    setReqSent(true);
    setTimeout(() => {
      setReqSent(false); setRequestOpen(false); setReqName(''); setReqTopic('');
    }, 2500);
  };

  return (
    <section id="study" className="section-padding bg-gradient-to-b from-white to-cream relative overflow-hidden">
      <div className="absolute top-20 left-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-navy-900/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          kicker="Study Material"
          title="Premium study resources, organized by subject"
          subtitle="Access NCERT-based notes, PDF booklets, practice sets, previous year board papers, and test material for every subject we teach. Hand-curated by our teachers."
        />

        {/* Top stats strip */}
        <Reveal delay={0.15}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 mb-8">
            {[
              { label: 'Total Resources', value: materials.length, icon: <BookOpen className="w-4 h-4" />, color: 'from-[#0F2449] to-[#2b2f77]' },
              { label: 'Subjects Covered', value: SUBJECT_GROUPS.length, icon: <BookMarked className="w-4 h-4" />, color: 'from-[#D4AF37] to-[#b8932a]', dark: true },
              { label: 'Pages of Content', value: '1500+', icon: <FileText className="w-4 h-4" />, color: 'from-emerald-500 to-teal-600' },
              { label: 'Updated', value: '2025', icon: <Sparkles className="w-4 h-4" />, color: 'from-rose-500 to-pink-600' },
            ].map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-4 premium-shadow-lg relative overflow-hidden`}>
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{s.label}</div>
                    <div className="font-display font-black text-2xl md:text-3xl mt-1">{s.value}</div>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    {s.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Search & filter bar */}
        <Reveal delay={0.2}>
          <div className="bg-white rounded-2xl p-4 premium-shadow border border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes, chapters, papers…"
                  className="input pl-10"
                />
              </div>
              <button onClick={() => setRequestOpen(true)} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-br from-[#0F2449] to-[#2b2f77] text-white hover:shadow-lg transition whitespace-nowrap">
                <PlusCircle className="w-4 h-4" /> Request Material
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-br from-[#0F2449] to-[#2b2f77] text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                  {cat.id !== 'all' && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20' : 'bg-white'}`}>{totalByCategory[cat.id] ?? 0}</span>}
                </button>
              ))}
            </div>

            {/* Subject filter chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveSubject('all')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
                  activeSubject === 'all' ? 'bg-[#D4AF37] text-[#0a0c28] shadow-sm' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
                }`}
              >
                All Subjects
              </button>
              {SUBJECT_GROUPS.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setActiveSubject(g.name)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition ${
                    activeSubject === g.name ? `bg-gradient-to-br ${g.gradient} text-white shadow-sm` : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className={activeSubject === g.name ? 'text-white' : g.color}>{g.icon}</span>
                  {g.name}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSubject === g.name ? 'bg-white/20' : 'bg-white'}`}>{totalBySubject[g.name] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Results count */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing <strong className="text-[#0F2449]">{filtered.length}</strong> resource{filtered.length !== 1 ? 's' : ''}
            {activeSubject !== 'all' && <> for <strong className="text-[#0F2449]">{activeSubject}</strong></>}
            {activeCategory !== 'all' && <> in <strong className="text-[#0F2449]">{CATEGORIES.find(c => c.id === activeCategory)?.label}</strong></>}
          </div>
        </div>

        {/* Resource cards */}
        {loadingMaterials ? (
          <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="inline-flex w-10 h-10 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin mb-3" />
            <h4 className="font-display font-bold text-lg text-slate-700">Loading study material…</h4>
            <p className="text-sm text-slate-500 mt-1">Published resources are being loaded.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 items-center justify-center mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h4 className="font-display font-bold text-lg text-slate-700">No resources found</h4>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filtered.map((m, i) => {
              const group = SUBJECT_GROUPS.find((g) => g.name === m.subject);
              return (
                <Reveal key={m.id} delay={(i % 9) * 0.04}>
                  <div className="group relative bg-white rounded-2xl p-5 premium-shadow border border-slate-100 hover:border-[#D4AF37]/50 hover:-translate-y-1 transition-all h-full flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${group?.gradient ?? 'from-slate-500 to-slate-700'} text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                        {group?.icon ?? <BookOpen className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <TypeBadge type={m.type} />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{m.subject}</span>
                            </div>
                            <h3 className="font-display font-bold text-[#0F2449] leading-snug mt-1 text-sm md:text-base">{m.title}</h3>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3 text-[11px]">
                      {m.pages && (
                        <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-center">
                          <div className="font-black text-slate-800">{m.pages}</div>
                          <div className="text-slate-500 font-semibold text-[9px] uppercase tracking-wider">Pages</div>
                        </div>
                      )}
                      {m.chapters && (
                        <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-center">
                          <div className="font-black text-slate-800 leading-tight text-[10px] mt-0.5">{m.chapters}</div>
                          <div className="text-slate-500 font-semibold text-[9px] uppercase tracking-wider">Coverage</div>
                        </div>
                      )}
                    </div>

                    {m.forClass && (
                      <div className="text-[11px] text-slate-600 mb-3 flex items-center gap-1.5">
                        <GraduationCap className="w-3 h-3 text-[#D4AF37]" />
                        <span>{m.forClass}</span>
                        {m.size && <><span className="text-slate-300">•</span><span>{m.size}</span></>}
                      </div>
                    )}

                    <div className="mt-auto pt-3 border-t border-slate-100 flex gap-2">
                      {m.file ? (
                        <>
                          <a
                            href={fileUrl(m.file)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold bg-navy-50 text-navy-700 hover:bg-navy-100 transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </a>
                          <a
                            href={fileUrl(m.file)}
                            download
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold gold-gradient text-[#0a0c28] shadow-sm hover:brightness-110 transition"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>
                        </>
                      ) : (
                        <div className="w-full text-center py-2 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-400">
                          File not uploaded yet
                        </div>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-amber-600" />
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* Bottom notice */}
        <Reveal delay={0.2}>
          <div className="mt-8 bg-gradient-to-r from-[#0F2449] to-[#2b2f77] rounded-2xl p-5 md:p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 premium-shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37] text-[#0a0c28] flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-black text-lg">Need a specific topic or chapter?</h4>
                <p className="text-white/70 text-sm">Use the "Request Material" button above. Our teacher will prepare and upload it for you.</p>
              </div>
            </div>
            <button onClick={() => setRequestOpen(true)} className="btn-primary shrink-0">
              <PlusCircle className="w-4 h-4" /> Request Topic
            </button>
          </div>
        </Reveal>
      </div>

      {/* Request material modal */}
      <AnimatePresence>
        {requestOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setRequestOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-6 premium-shadow-lg"
            >
              <div className="text-center mb-5">
                <div className="inline-flex w-14 h-14 rounded-2xl gold-gradient text-[#0a0c28] items-center justify-center mb-3">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <h3 className="font-display font-black text-2xl text-[#0F2449]">Request Study Material</h3>
                <p className="text-sm text-slate-500 mt-1">Tell us what you need. Our teacher will arrange it.</p>
              </div>
              {reqSent ? (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-center font-semibold">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                  Your request has been sent to the teacher!
                </div>
              ) : (
                <form onSubmit={submitRequest} className="space-y-3">
                  <div>
                    <label className="label">Your Name</label>
                    <input className="input" value={reqName} onChange={(e) => setReqName(e.target.value)} placeholder="Your full name" required />
                  </div>
                  <div>
                    <label className="label">Subject</label>
                    <select className="input" value={reqSubject} onChange={(e) => setReqSubject(e.target.value)}>
                      {SUBJECT_GROUPS.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">What do you need?</label>
                    <textarea className="input" rows={3} value={reqTopic} onChange={(e) => setReqTopic(e.target.value)} placeholder="e.g. Notes on Light – Reflection and Refraction (Class 10) with solved numericals" required />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setRequestOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="flex-1 btn-primary justify-center">
                      <Send className="w-4 h-4" /> Submit Request
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* =========================================================
   TEST / PRACTICE SECTION
   ========================================================= */
export function TestsSection() {
  const [tests, setTests] = useState<PublicTest[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);

  useEffect(() => {
    let active = true;
    fetchTests()
      .then((list) => {
        if (active) setTests(list);
      })
      .catch(() => {
        if (active) setTests([]);
      })
      .finally(() => {
        if (active) setLoadingTests(false);
      });
    return () => { active = false; };
  }, []);

  const testGradient = (subject?: string) => {
    const value = (subject || '').toLowerCase();
    if (value.includes('math')) return 'from-blue-500 to-indigo-600';
    if (value.includes('science')) return 'from-emerald-500 to-teal-600';
    if (value.includes('english')) return 'from-rose-500 to-pink-600';
    if (value.includes('nmms') || value.includes('mat') || value.includes('sat')) return 'from-violet-500 to-purple-600';
    return 'from-sky-500 to-cyan-600';
  };

  return (
    <section id="tests" className="section-padding bg-cream">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading kicker="Tests & Practice" title="Measure progress with real exam-style tests" subtitle="Regular tests and performance analysis are part of every batch. More tests are published weekly by the teacher." />

        {loadingTests ? (
          <div className="mt-10 bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="inline-flex w-10 h-10 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin mb-3" />
            <h4 className="font-display font-bold text-lg text-slate-700">Loading tests…</h4>
            <p className="text-sm text-slate-500 mt-1">Published tests are being loaded.</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="mt-10 bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 items-center justify-center mb-3">
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <h4 className="font-display font-bold text-lg text-slate-700">No tests published yet</h4>
            <p className="text-sm text-slate-500 mt-1">New tests will appear here when the teacher publishes them.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {tests.map((t, i) => (
              <Reveal key={t.id} delay={(i % 8) * 0.05}>
                <div className="relative bg-white rounded-2xl p-5 premium-shadow border border-slate-100 flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${testGradient(t.course || t.batch)} text-white flex items-center justify-center mb-3`}>
                    <ClipboardCheck className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{t.course || t.batch || 'OATH CLASSES'}</div>
                  <h3 className="font-display font-bold text-lg text-[#0F2449] mt-1">{t.title}</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <Stat label="Questions" value={t.questions != null ? t.questions.toString() : '—'} />
                    <Stat label="Duration" value={t.duration != null ? `${t.duration} min` : '—'} />
                  </div>
                  {t.marks != null && (
                    <div className="text-[11px] text-slate-500 text-center mt-2">Total Marks: <strong className="text-slate-700">{t.marks}</strong></div>
                  )}
                  <button className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-[#0F2449] text-white hover:bg-[#D4AF37] hover:text-[#0a0c28] transition">
                    <PlayCircle className="w-4 h-4" /> Start Test
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function AnnouncementsSection() {
  const [items, setItems] = useState<PublicAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetchAnnouncements()
        .then((list) => { if (active) setItems(list); })
        .catch(() => { /* keep whatever is shown */ })
        .finally(() => { if (active) setLoading(false); });
    load();
    const t = setInterval(load, 60000); // pick up newly published notices without a page reload
    return () => { active = false; clearInterval(t); };
  }, []);

  const fmt = (d?: string) => {
    const t = d ? new Date(d) : null;
    return t && !isNaN(t.getTime()) ? t.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  };

  return (
    <section id="announcements" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading kicker="Announcements" title="Latest notices from OATH CLASSES" subtitle="Test dates, batch updates and important notices from the teacher appear here." />

        {loading ? (
          <div className="mt-10 bg-cream rounded-2xl border border-slate-100 p-12 text-center">
            <div className="inline-flex w-10 h-10 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin mb-3" />
            <h4 className="font-display font-bold text-lg text-slate-700">Loading announcements…</h4>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 bg-cream rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 items-center justify-center mb-3">
              <Megaphone className="w-7 h-7" />
            </div>
            <h4 className="font-display font-bold text-lg text-slate-700">No announcements yet</h4>
            <p className="text-sm text-slate-500 mt-1">New notices will appear here as soon as the teacher publishes them.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {items.map((a, i) => (
              <Reveal key={a.id} delay={(i % 6) * 0.05}>
                <div className="relative bg-cream rounded-2xl p-5 premium-shadow border border-slate-100 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-[#D4AF37] text-[#0a0c28] flex items-center justify-center">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /> {fmt(a.date)}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                    {[a.course, a.batch].filter((x) => x && x !== 'All').join(' • ') || 'All Students'}
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#0F2449] mt-1">{a.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy-50 rounded-lg px-2 py-1.5 text-center">
      <div className="font-black text-navy-700 text-sm">{value}</div>
      <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

/* =========================================================
   PARENTS SECTION
   ========================================================= */
export function ParentsSection() {
  return (
    <section id="parents" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <TrendingUp className="w-6 h-6" />, t: 'Progress Reports', d: 'Regular updates on your child\'s performance in every test.' },
                  { icon: <Calendar className="w-6 h-6" />, t: 'Parent Meetings', d: 'Scheduled parent-teacher meetings and feedback sessions.' },
                  { icon: <ClipboardCheck className="w-6 h-6" />, t: 'Test Performance', d: 'Detailed analysis of every test with strengths and areas to improve.' },
                  { icon: <MessageCircle className="w-6 h-6" />, t: 'Teacher Guidance', d: 'Open communication with the teacher for any academic concern.' },
                ].map((c, i) => (
                  <div key={i} className="bg-cream rounded-2xl p-4 premium-shadow border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2449] text-[#D4AF37] flex items-center justify-center mb-2">{c.icon}</div>
                    <div className="font-display font-bold text-base text-[#0F2449]">{c.t}</div>
                    <div className="text-xs text-slate-600 mt-1">{c.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <Reveal>
              <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-xs tracking-[0.4em] uppercase mb-3">
                <span className="h-px w-8 bg-[#D4AF37]" /> For Parents <span className="h-px w-8 bg-[#D4AF37]" />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display font-black text-3xl md:text-5xl text-[#0F2449] leading-tight">
                Partnering with you in your child's <span className="gold-text">success</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-4 text-slate-600 leading-relaxed">
                At OATH CLASSES, we consider parents equal partners in a student's journey. You will receive regular updates on attendance, test results, syllabus completion, and overall behaviour — along with honest, actionable feedback from the teacher.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {[
                  'Regular Parent Meetings & Feedback',
                  'Timely syllabus completion & updates',
                  'Result-oriented learning system',
                  'Personal attention and progress reports',
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.4}>
              <a href={`tel:${INSTITUTE.phone1}`} className="btn-primary mt-6">
                <Phone className="w-4 h-4" /> Speak to Teacher
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   DOUBT SOLVING SECTION
   ========================================================= */
export function DoubtsSection() {
  const { doubts, addDoubt } = useStore();
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [problem, setProblem] = useState('');

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !question.trim()) return;
    setProblem('');
    addDoubt({ studentName: studentName.trim(), subject, question: question.trim(), imageUrl: image }).then((result) => {
      if (result === 'offline') setProblem('Could not reach the server, so the teacher has NOT received this doubt yet. Please check your connection and submit again.');
      else if (result === 'saved-without-image') setProblem('Your question was sent, but the photo could not be uploaded. Please try attaching a smaller JPG/PNG image.');
      setTimeout(() => setProblem(''), 8000);
    });
    setStudentName(''); setQuestion(''); setImage(undefined);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const myDoubts = doubts; // In a real app, filter by logged-in student

  return (
    <section id="doubts" className="section-padding bg-gradient-to-b from-cream to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading kicker="Doubt Solving" title="Ask a doubt. Get the teacher's answer." subtitle="Type your question, attach a photo, and submit. Our teacher will answer directly on this portal. No WhatsApp needed." center />

        <div className="grid lg:grid-cols-5 gap-6 mt-10">
          {/* Form */}
          <Reveal className="lg:col-span-2">
            <form onSubmit={submit} className="bg-white rounded-3xl p-6 premium-shadow border border-slate-100 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-2xl" />
              <h3 className="font-display font-black text-xl text-[#0F2449] mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#D4AF37]" /> Submit Your Doubt
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Your Name</label>
                  <input className="input" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Aarav Sharma" required />
                </div>
                <div>
                  <label className="label">Subject</label>
                  <select className="input" value={subject} onChange={(e) => setSubject(e.target.value as Subject)}>
                    {ALL_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Your Question</label>
                  <textarea className="input" rows={4} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your doubt clearly. Our teacher will answer here." required />
                </div>
                <div>
                  <label className="label flex items-center gap-2 cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 hover:border-[#D4AF37] text-sm text-slate-600 transition">
                      <ImageIcon className="w-4 h-4" /> {image ? 'Change image' : 'Upload question image (optional)'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                  </label>
                  {image && (
                    <div className="relative mt-2 inline-block">
                      <img src={image} alt="Question" className="max-h-40 rounded-lg border border-slate-200" />
                      <button type="button" onClick={() => setImage(undefined)} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  <Send className="w-4 h-4" /> Submit Doubt
                </button>
                <AnimatePresence>
                  {submitted && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-3 text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Doubt submitted! Teacher will reply shortly.
                    </motion.div>
                  )}
                </AnimatePresence>
                {problem && (
                  <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-3 text-sm font-semibold">{problem}</div>
                )}
              </div>
            </form>
          </Reveal>

          {/* Doubts list */}
          <div className="lg:col-span-3">
            <Reveal>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-black text-xl text-[#0F2449]">Your Doubts & Teacher Answers</h3>
                <div className="flex gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700"><ClockIcon className="w-3 h-3" /> {myDoubts.filter((d) => d.status === 'pending').length} Pending</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> {myDoubts.filter((d) => d.status === 'answered').length} Answered</span>
                </div>
              </div>
            </Reveal>
            {myDoubts.length === 0 ? (
              <EmptyBox icon={<MessageCircle className="w-10 h-10" />} title="No doubts yet" subtitle="When you submit a doubt, it will appear here along with the teacher's answer." />
            ) : (
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {myDoubts.map((d) => <DoubtCard key={d.id} doubt={d} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DoubtCard({ doubt }: { doubt: Doubt }) {
  const { deleteDoubt } = useStore();
  const [open, setOpen] = useState(doubt.status === 'pending');
  return (
    <motion.div layout className="bg-white rounded-2xl border border-slate-100 premium-shadow overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <button onClick={() => setOpen(!open)} className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
          doubt.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {doubt.status === 'pending' ? <ClockIcon className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setOpen(!open)}>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{doubt.subject}</span>
            <span className="text-[11px] font-semibold text-slate-500">{doubt.studentName}</span>
            <span className={`text-[10px] font-black uppercase tracking-wider ml-auto ${doubt.status === 'pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
              {doubt.status}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 line-clamp-1">{doubt.question}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); deleteDoubt(doubt.id); }}
          title="Delete doubt"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shrink-0 self-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100">
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Your question</div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{doubt.question}</p>
              </div>
              {doubt.imageUrl && (
                <img src={doubt.imageUrl} alt="Question" className="max-h-56 rounded-lg border border-slate-200" />
              )}
              {doubt.status === 'answered' && doubt.answer && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-r-xl p-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1 uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4" /> Teacher's Answer
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{doubt.answer}</p>
                </div>
              )}
              {doubt.status === 'pending' && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-3 flex items-center gap-2 text-amber-700 text-sm">
                  <ClockIcon className="w-4 h-4" /> Waiting for teacher's response…
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* =========================================================
   Q&A SECTION
   ========================================================= */
export function QASection() {
  const { qaItems, addQA } = useStore();
  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [qText, setQText] = useState('');
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [filterSubj, setFilterSubj] = useState<Subject | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return qaItems
      .filter((q) => filterSubj === 'all' || q.subject === filterSubj)
      .filter((q) => !search || q.question.toLowerCase().includes(search.toLowerCase()) || (q.answer ?? '').toLowerCase().includes(search.toLowerCase()))
      .filter((q) => q.answer); // Only show answered publicly
  }, [qaItems, filterSubj, search]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;
    addQA({ subject, question: qText.trim(), studentName: name.trim() || 'Student' });
    setQText('');
  };

  return (
    <section id="qa" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading kicker="Questions & Answers" title="Ask, search, read teacher answers" subtitle="Browse previously answered questions by subject, or post a new academic question. Answers from the teacher will appear right here." center />

        {/* Search + filters */}
        <div className="mt-8 grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions or answers…" className="input pl-10" />
          </div>
          <select value={filterSubj} onChange={(e) => setFilterSubj(e.target.value as Subject | 'all')} className="input lg:col-span-1">
            <option value="all">All Subjects</option>
            {ALL_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => document.getElementById('qa-form')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary justify-center">
            <HelpCircle className="w-4 h-4" /> Ask Question
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-3">
            {filtered.length === 0 ? (
              <EmptyBox icon={<HelpCircle className="w-10 h-10" />} title="No matching answers" subtitle="Try a different search or subject filter." />
            ) : (
              filtered.map((q) => <QACard key={q.id} q={q} open={openId === q.id} onToggle={() => setOpenId(openId === q.id ? null : q.id)} />)
            )}
          </div>

          {/* Ask form */}
          <form id="qa-form" onSubmit={submit} className="bg-gradient-to-br from-[#0a0c28] to-[#1e2259] rounded-3xl p-6 text-white premium-shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-3xl" />
            <h3 className="font-display font-black text-xl mb-4 relative">Post a Question</h3>
            <div className="space-y-3 relative">
              <div>
                <label className="label text-white/80">Your name (optional)</label>
                <input className="input bg-white/10 border-white/20 text-white placeholder-white/40" value={name} onChange={(e) => setName(e.target.value)} placeholder="Anonymous" />
              </div>
              <div>
                <label className="label text-white/80">Subject</label>
                <select className="input bg-white/10 border-white/20 text-white" value={subject} onChange={(e) => setSubject(e.target.value as Subject)}>
                  {ALL_SUBJECTS.map((s) => <option key={s} value={s} className="text-slate-900">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-white/80">Your question</label>
                <textarea className="input bg-white/10 border-white/20 text-white placeholder-white/40 resize-none" rows={4} value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Ask anything related to your studies…" />
              </div>
              <button type="submit" className="w-full btn-primary justify-center">
                <Send className="w-4 h-4" /> Submit Question
              </button>
              <p className="text-[11px] text-white/50 text-center">Answers will be posted by the teacher. Check back here soon.</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function QACard({ q, open, onToggle }: { q: QAItem; open: boolean; onToggle: () => void }) {
  return (
    <motion.div layout className="bg-white rounded-2xl border border-slate-100 premium-shadow overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4 flex items-start gap-3 hover:bg-navy-50/40 transition">
        <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">{q.subject}</span>
            <span className="text-[11px] text-slate-400">{new Date(q.createdAt).toLocaleDateString()}</span>
            {q.answer && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Answered</span>}
          </div>
          <p className="font-semibold text-slate-800 text-sm">{q.question}</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {open && q.answer && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="p-4 pt-0">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-r-xl p-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" /> Teacher's Answer
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{q.answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyBox({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
      <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 items-center justify-center mb-3">{icon}</div>
      <h4 className="font-display font-bold text-lg text-slate-700">{title}</h4>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

/* =========================================================
   TOPPERS
   ========================================================= */
export function ToppersSection() {
  const slots = Array.from({ length: 8 });
  return (
    <section id="toppers" className="section-padding bg-cream">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading kicker="Our Toppers" title="Student Achievements" subtitle="Photographs and details of our successful students will appear here. Placeholder cards are shown below — update with actual student photographs, names and achievements." center />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-10">
          {slots.map((_, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="group relative bg-white rounded-2xl overflow-hidden premium-shadow border border-slate-100 hover:border-[#D4AF37]/40 transition-all hover:-translate-y-1">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 30% 20%, #fff, transparent 50%)',
                  }} />
                  <div className="relative text-center text-slate-400">
                    <div className="w-20 h-20 mx-auto rounded-full bg-white flex items-center justify-center shadow-inner border-2 border-dashed border-slate-300 group-hover:border-[#D4AF37] transition">
                      <User className="w-8 h-8 text-slate-300 group-hover:text-[#D4AF37] transition" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mt-2">Student Photo</div>
                  </div>
                  {/* Gold badge */}
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-full gold-gradient flex items-center justify-center shadow-lg text-[#0a0c28]">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-4 text-center border-t border-slate-100 bg-white">
                  <div className="font-display font-bold text-[#0F2449]">Student Name</div>
                  <div className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-wider mt-0.5">Achievement / Rank</div>
                  <div className="text-[10px] text-slate-500 mt-1">Year / Category</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CONTACT
   ========================================================= */
export function ContactSection() {
  return (
    <section id="contact" className="section-padding relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0a0c28 0%, #1e2259 60%, #0a0c28 100%)',
    }}>
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2b2f77]/30 rounded-full blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-white">
        <div className="text-center mb-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-xs tracking-[0.4em] uppercase mb-3">
              <Phone className="w-4 h-4" /> Contact Us <Phone className="w-4 h-4" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display font-black text-3xl md:text-5xl">Let's secure your seat today</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-2 text-white/70 font-hindi text-lg">Admissions Open — Limited Seats</p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: <Phone className="w-6 h-6" />, title: 'Call Us', lines: [INSTITUTE.phone1, INSTITUTE.phone2], action: `tel:${INSTITUTE.phone1}`, actionLabel: 'Call now' },
            { icon: <MapPin className="w-6 h-6" />, title: 'Address', lines: [INSTITUTE.address], action: '#', actionLabel: 'Get directions' },
            { icon: <BookOpen className="w-6 h-6" />, title: 'Programs', lines: ['Class 9 & 10', 'NMMS • MAT • SAT • Foundation'], action: '#courses', actionLabel: 'View courses' },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="h-full bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-[#D4AF37]/40 transition relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-[#D4AF37]/10 blur-xl group-hover:bg-[#D4AF37]/20 transition" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl gold-gradient text-[#0a0c28] flex items-center justify-center mb-3 shadow-lg">
                    {c.icon}
                  </div>
                  <h3 className="font-display font-black text-xl">{c.title}</h3>
                  <div className="mt-2 space-y-0.5">
                    {c.lines.map((l) => <div key={l} className="text-white/80 font-hindi text-sm">{l}</div>)}
                  </div>
                  {c.title === 'Call Us' ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`tel:${INSTITUTE.phone1}`} className="px-3 py-1.5 rounded-full text-xs font-bold gold-gradient text-[#0a0c28]">{INSTITUTE.phone1}</a>
                      <a href={`tel:${INSTITUTE.phone2}`} className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/20">{INSTITUTE.phone2}</a>
                    </div>
                  ) : c.title === 'Address' ? (
                    <div className="mt-3 text-xs font-hindi text-[#D4AF37]">Near Sai Dham, Puchha Kharela</div>
                  ) : (
                    <button onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })} className="mt-3 text-xs font-bold text-[#D4AF37] hover:underline">
                      View Courses →
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-10 text-center">
            <a href={`tel:${INSTITUTE.phone1}`} className="btn-primary text-base">
              <Phone className="w-5 h-5" /> {INSTITUTE.phone1}
            </a>
            <div className="mt-3 text-white/60 text-sm font-hindi">{INSTITUTE.bottomHindi}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */
export function Footer() {
  return (
    <footer className="bg-[#05061a] text-white/80 pt-14 pb-6 border-t border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <Logo size={52} showText={false} />
              <div>
                <div className="font-display font-black text-2xl text-white">OATH <span className="text-[#D4AF37]">CLASSES</span></div>
                <div className="text-[10px] tracking-[0.3em] text-white/60 uppercase font-bold">Concept • Marks • Success</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-md text-white/70 font-hindi">
              {INSTITUTE.hindiTopRight}
            </p>
            <p className="text-xs mt-3 text-white/50">
              Premier coaching for Class 9 & 10 along with NMMS / MAT / SAT / FOUNDATION. Based at {INSTITUTE.address}.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['home','Home'],['courses','Courses'],['nmms','NMMS 2027'],['doubts','Doubt Solving'],['qa','Q&A'],['contact','Contact']].map(([id, l]) => (
                <li key={id}><button onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#D4AF37] transition">{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href={`tel:${INSTITUTE.phone1}`} className="hover:text-[#D4AF37] transition flex items-center gap-2"><Phone className="w-4 h-4" /> {INSTITUTE.phone1}</a></li>
              <li><a href={`tel:${INSTITUTE.phone2}`} className="hover:text-[#D4AF37] transition flex items-center gap-2"><Phone className="w-4 h-4" /> {INSTITUTE.phone2}</a></li>
              <li className="flex items-start gap-2 font-hindi"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#D4AF37]" /> {INSTITUTE.address}</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div>© {new Date().getFullYear()} OATH CLASSES. All rights reserved.</div>
          <div className="font-hindi">{INSTITUTE.bottomHindi}</div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   Section heading helper
   ========================================================= */
function SectionHeading({ kicker, title, subtitle, center }: { kicker: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={center ? 'text-center max-w-3xl mx-auto' : ''}>
      <Reveal>
        <div className={`inline-flex items-center gap-2 text-[#D4AF37] font-bold text-xs tracking-[0.4em] uppercase mb-3 ${center ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-[#D4AF37]" /> {kicker} <span className="h-px w-8 bg-[#D4AF37]" />
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] leading-tight dark:text-white">{title}</h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.2}>
          <p className={`mt-3 text-slate-600 ${center ? 'mx-auto' : ''} max-w-2xl text-sm md:text-base`}>{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

/* Admin login modal */
export function AdminLogin({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default password is "oath123" — for demo. In production use backend auth.
    if (pw === 'oath123' || pw === 'admin') {
      onSuccess();
    } else {
      setErr('Invalid password. Use "oath123" for demo.');
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md p-6 premium-shadow-lg"
      >
        <div className="text-center mb-5">
          <div className="inline-flex w-14 h-14 rounded-2xl navy-gradient text-[#D4AF37] items-center justify-center mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h3 className="font-display font-black text-2xl text-[#0F2449]">Teacher / Admin Login</h3>
          <p className="text-sm text-slate-500 mt-1">Enter password to access the dashboard.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={pw} onChange={(e) => { setPw(e.target.value); setErr(''); }} placeholder="Enter password" autoFocus />
            {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
          </div>
          <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100">
            Demo password: <code className="font-bold text-navy-700">oath123</code>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
            <button type="submit" className="flex-1 btn-primary justify-center">
              <Lock className="w-4 h-4" /> Login
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
