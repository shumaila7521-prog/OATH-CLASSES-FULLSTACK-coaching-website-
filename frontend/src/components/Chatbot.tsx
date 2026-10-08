import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Phone, BookOpen, HelpCircle, Users, MapPin } from 'lucide-react';
import { ChatMessage, getChatbotReply, INSTITUTE } from '../lib/store';

const SUGGESTED = [
  'How can I ask a doubt?',
  'What subjects are available?',
  'Tell me about NMMS results',
  'How can I contact OATH Classes?',
  'What study material is available?',
  'How does the doubt session work?',
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: `नमस्ते! I'm the OATH Classes AI Assistant. I can help with admissions, subjects, doubts, NMMS, study material, tests, results & contact info. How can I help you today?`,
      time: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: content, time: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getChatbotReply(content);
      setMessages((m) => [...m, { id: `b-${Date.now()}`, role: 'bot', text: reply, time: Date.now() }]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[60] group"
        aria-label="Open AI Assistant"
      >
        <span className="absolute inset-0 rounded-full animate-pulse-glow" />
        <span className="relative block w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-[3px] border-[#D4AF37] shadow-2xl bg-gradient-to-br from-[#0a0c28] to-[#1e2259]">
          <TeacherAvatar />
        </span>
        {!open && (
          <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#0a0c28] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce">
            AI
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="fixed bottom-24 right-5 z-[60] w-[92vw] max-w-[390px] h-[580px] max-h-[80vh] rounded-3xl overflow-hidden premium-shadow-lg bg-white dark:bg-[#10152a] flex flex-col border border-[#D4AF37]/30"
          >
            {/* Header */}
            <div className="relative p-4 navy-gradient border-b border-[#D4AF37]/30 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#D4AF37] shrink-0 bg-[#1e2259]">
                <TeacherAvatar small />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm flex items-center gap-1.5">
                  OATH Classes AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
                <div className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Online • Ready to help
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-cream to-white dark:from-[#0a0e1d] dark:to-[#10152a]">
              {messages.map((m) => (
                <ChatBubble key={m.id} msg={m} />
              ))}
              {typing && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D4AF37]/50 shrink-0 bg-[#1e2259]">
                    <TeacherAvatar small />
                  </div>
                  <div className="bg-white border border-navy-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-typing" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-white border-t border-navy-50">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] px-2.5 py-1.5 rounded-full bg-navy-50 text-navy-700 hover:bg-[#D4AF37]/15 hover:text-navy-800 transition font-medium flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Quick actions */}
            <div className="px-3 py-2 bg-white flex gap-2 border-t border-navy-50">
              <QuickAction icon={<Phone className="w-3 h-3" />} label="Call" onClick={() => window.open(`tel:${INSTITUTE.phone1}`, '_self')} />
              <QuickAction icon={<BookOpen className="w-3 h-3" />} label="Courses" onClick={() => { setOpen(false); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} />
              <QuickAction icon={<Users className="w-3 h-3" />} label="Doubts" onClick={() => { setOpen(false); document.getElementById('doubts')?.scrollIntoView({ behavior: 'smooth' }); }} />
              <QuickAction icon={<MapPin className="w-3 h-3" />} label="Location" onClick={() => { setOpen(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-[#10152a] border-t border-navy-100 dark:border-white/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask me anything about OATH Classes…"
                className="flex-1 px-3 py-2.5 rounded-full border border-navy-100 dark:border-white/10 bg-navy-50/40 dark:bg-white/5 dark:text-white dark:placeholder-white/40 text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white dark:focus:bg-white/10 transition"
              />
              <button
                onClick={() => send()}
                className="w-10 h-10 rounded-full gold-gradient text-[#0a0c28] flex items-center justify-center shadow-lg hover:scale-105 transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 text-[11px] py-1.5 rounded-full border border-navy-100 text-navy-700 hover:bg-navy-50 transition font-medium flex items-center justify-center gap-1"
    >
      {icon}
      {label}
    </button>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D4AF37]/50 shrink-0 bg-[#1e2259]">
          <TeacherAvatar small />
        </div>
      )}
      <div
        className={`relative max-w-[78%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? 'bg-gradient-to-br from-[#1e2259] to-[#2b2f77] text-white rounded-2xl rounded-br-sm shadow-md bubble-user'
            : 'bg-white text-navy-900 rounded-2xl rounded-bl-sm shadow-sm border border-navy-100 bubble-bot'
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

/**
 * Teacher avatar — uses the provided teacher photograph reference as a CSS-styled portrait.
 * The instructor can replace the background with a real photo by adding /images/teacher.jpg
 */
function TeacherAvatar({ small = false }: { small?: boolean }) {
  return (
    <div className="relative w-full h-full">
      <img
        src="/images/teacher.jpg"
        alt="Teacher"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to a styled silhouette if image not found
          (e.currentTarget as HTMLImageElement).style.display = 'none';
          const fallback = (e.currentTarget.parentElement as HTMLElement)?.querySelector('.avatar-fallback');
          if (fallback) (fallback as HTMLElement).style.display = 'flex';
        }}
      />
      <div
        className="avatar-fallback absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2b2f77] to-[#0a0c28] text-[#D4AF37] font-display font-black"
        style={{ display: 'none', fontSize: small ? '0.9rem' : '1.5rem' }}
      >
        OC
      </div>
    </div>
  );
}
