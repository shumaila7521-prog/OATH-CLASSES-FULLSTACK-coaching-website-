import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StoreProvider, useStore } from './lib/store';
import { ThemeProvider } from './lib/theme';
import Chatbot from './components/Chatbot';
import AdminDashboard from './components/Admin';
import EnrollModal from './components/EnrollModal';
import {
  Navbar, Hero, AboutStrip, MentorSection, CoursesSection, FeaturesSection,
  NMMSSection, StudyMaterialSection, TestsSection, AnnouncementsSection, ParentsSection, DoubtsSection,
  QASection, ToppersSection, ContactSection, Footer, AdminLogin,
} from './components/Sections';
import { ArrowUp } from 'lucide-react';

function AppContent() {
  const { isAdmin, setIsAdmin } = useStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Listen for custom event from Navbar
  useEffect(() => {
    const handler = () => setShowLogin(true);
    window.addEventListener('oath-admin-click', handler);
    return () => window.removeEventListener('oath-admin-click', handler);
  }, []);

  // Admin access is no longer linked from the public site. Open <site-url>/#admin to reach the login.
  useEffect(() => {
    const check = () => {
      if (window.location.hash === '#admin') {
        setShowLogin(true);
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  if (isAdmin) {
    return (
      <>
        <AdminDashboard onExit={() => setIsAdmin(false)} />
        <Chatbot />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0a0e1d] text-[var(--color-ink)] overflow-x-hidden">
      <Navbar onEnrollClick={() => setShowEnroll(true)} />
      <main>
        <Hero />
        <AboutStrip />
        <AnnouncementsSection />
        <MentorSection />
        <CoursesSection />
        <FeaturesSection />
        <NMMSSection />
        <StudyMaterialSection />
        <TestsSection />
        <ParentsSection />
        <DoubtsSection />
        <QASection />
        <ToppersSection />
        <ContactSection />
      </main>
      <Footer />

      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-10 h-10 rounded-full navy-gradient text-[#D4AF37] shadow-lg flex items-center justify-center"
            title="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <Chatbot />

      <AnimatePresence>
        {showEnroll && <EnrollModal onClose={() => setShowEnroll(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showLogin && (
          <AdminLogin
            onClose={() => setShowLogin(false)}
            onSuccess={() => {
              setShowLogin(false);
              setIsAdmin(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </ThemeProvider>
  );
}
