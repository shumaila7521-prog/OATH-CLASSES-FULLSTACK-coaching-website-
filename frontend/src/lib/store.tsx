import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  submitRegistration, uploadImage, submitDoubt, fetchMyDoubts, submitQuestion, fetchQna, fileUrl,
  type ServerDoubt, type ServerQA,
} from './api';

// ============ INSTITUTE INFORMATION (PRESERVED EXACTLY FROM FLYERS) ============
export const INSTITUTE = {
  name: 'OATH CLASSES',
  tagline: 'CONCEPT STRONG • MARKS SURE • SUCCESS GUARANTEED',
  hindiTopRight: 'जहाँ मेहनत को मिलती है सही दिशा और बेहतर परिणाम!',
  classes: 'Class 9 & 10',
  hindiSubheadline: 'सही समय, सही मार्गदर्शन, बेहतर भविष्य!',
  bottomHindi: 'मेहनत आपकी, सफलता हमारी जिम्मेदारी!',
  admissionOpen: true,
  limitedSeats: 'Limited Seats — आज ही अपना प्रवेश सुनिश्चित करें!',
  aajKiTaiyari: 'आज की तैयारी, कल की सफलता!',
  programs: ['NMMS', 'MAT', 'SAT', 'FOUNDATION'],
  phone1: '7992056986',
  phone2: '8957372887',
  address: 'Sai Dham के पास, Puchha Kharela',
  subjects: ['Mathematics', 'Science', 'English', 'Social Science'] as const,
};

export const FEATURES = [
  { icon: 'users-teacher', title: 'अनुभवी एवं समर्पित शिक्षक', hindi: 'जो बनाएं पढ़ाई को आसान', english: 'Experienced & Dedicated Teachers who make learning easier' },
  { icon: 'book-open', title: 'NCERT आधारित अध्ययन', hindi: 'और बोर्ड परीक्षा की पूर्ण तैयारी', english: 'NCERT-based study with complete board exam preparation' },
  { icon: 'target', title: 'Concept Clarity + Regular Test', hindi: 'और Performance Analysis', english: 'Concept clarity with regular tests and performance analysis' },
  { icon: 'messages', title: 'Doubt Session एवं व्यक्तिगत मार्गदर्शन', hindi: '', english: 'Doubt sessions with personal guidance' },
  { icon: 'trophy', title: '100% Exam-Oriented Teaching', hindi: '', english: '100% exam-oriented teaching methodology' },
];

export const FACILITIES = [
  { icon: 'clipboard', title: 'नियमित टेस्ट एवं मूल्यांकन', english: 'Regular Tests & Evaluation' },
  { icon: 'notebook', title: 'विषयवार नोट्स', english: 'Subject-wise Notes' },
  { icon: 'chart', title: 'परिणाम आधारित सीखने की प्रणाली', english: 'Result-oriented Learning System' },
  { icon: 'clock', title: 'समय पर सिलेबस पूरा', english: 'Timely Syllabus Completion' },
  { icon: 'users', title: 'Parent Meeting एवं फीडबैक', english: 'Parent Meetings & Feedback' },
  { icon: 'target', title: 'बेहतर योजना, बेहतर परिणाम', english: 'Better Planning, Better Results' },
];

export const NMMS_FEATURES = [
  { icon: 'user-graduate', title: 'अनुभवी मार्गदर्शन', english: 'Experienced Guidance' },
  { icon: 'book-open', title: 'MAT + SAT की सम्पूर्ण तैयारी', english: 'Complete MAT + SAT Preparation' },
  { icon: 'clipboard-check', title: 'साप्ताहिक टेस्ट', english: 'Weekly Tests' },
  { icon: 'books-stack', title: 'बेहतरीन स्टडी मटेरियल', english: 'Excellent Study Material' },
  { icon: 'chart', title: 'नियमित मूल्यांकन एवं फीडबैक', english: 'Regular Evaluation & Feedback' },
  { icon: 'id-card', title: 'व्यक्तिगत ध्यान एवं प्रगति रिपोर्ट', english: 'Personal Attention & Progress Reports' },
];

export const NMMS_STATS = [
  { year: 'NMMS 2025', count: 2, label: 'विद्यार्थियों का चयन', labelEn: 'Students Selected' },
  { year: 'NMMS 2026', count: 9, label: 'विद्यार्थियों का चयन', labelEn: 'Students Selected' },
];
export const NMMS_TOTAL = 11;
export const NMMS_TAGLINE = 'लगातार सफलता की पहचान';
export const NMMS_HINDI_MID = 'मेहनत • अनुशासन • सफलता';
export const NMMS_NEW_BATCH = 'NMMS 2027 New Batch Starting Soon';
export const NMMS_BOTTOM_QUOTE = 'सपने वही सच होते हैं, जो तैयारी सही दिशा में करते हैं!';

// ============ TYPES ============
export type Subject = typeof INSTITUTE.subjects[number] | 'NMMS / MAT / SAT';
export const ALL_SUBJECTS: Subject[] = [...INSTITUTE.subjects, 'NMMS / MAT / SAT'];

export type DoubtStatus = 'pending' | 'answered';
export interface Doubt {
  id: string;
  studentName: string;
  subject: Subject;
  question: string;
  imageUrl?: string;
  status: DoubtStatus;
  answer?: string;
  answeredAt?: number;
  createdAt: number;
}
export interface QAItem {
  id: string;
  subject: Subject;
  question: string;
  answer?: string;
  studentName?: string;
  createdAt: number;
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export interface Registration {
  id: string;
  studentName: string;
  guardianName: string;
  phone: string;
  email: string;
  course: string;
  school: string;
  address: string;
  message: string;
  status: RegistrationStatus;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  time: number;
}

// ============ KNOWLEDGE BASE FOR CHATBOT ============
export const KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['admission', 'admit', 'enroll', 'join', 'प्रवेश', 'एडमिशन'],
    answer: 'Admissions for Class 9 & 10 are NOW OPEN at OATH CLASSES. Seats are limited. Please call 7992056986 or 8957372887 to confirm your seat today.',
  },
  {
    keywords: ['nmms', 'mat', 'sat', 'foundation', 'scholarship'],
    answer: 'OATH CLASSES offers NMMS, MAT, SAT, and FOUNDATION programs. NMMS 2027 New Batch is starting soon. Results: 2 students selected in NMMS 2025, 9 students selected in NMMS 2026 — total 11 selections. Features: Experienced guidance, complete MAT + SAT prep, weekly tests, excellent study material, regular feedback, personal attention & progress reports.',
  },
  {
    keywords: ['class', 'grade', '9', '10', 'course', 'courses'],
    answer: 'We coach Class 9 and Class 10 students. Subjects taught: Mathematics, Science, English, and Social Science (SST). Teaching is 100% exam-oriented and NCERT-based with full board exam preparation.',
  },
  {
    keywords: ['subject', 'math', 'science', 'english', 'sst', 'social'],
    answer: 'Subjects at OATH CLASSES: Mathematics, Science, English, and Social Science (SST). We also prepare for NMMS (MAT + SAT).',
  },
  {
    keywords: ['doubt', 'ask', 'question', 'डाउट', 'संदेह'],
    answer: 'You can ask doubts through our integrated Doubt Solving portal — just scroll to the "Doubt Solving" section, select your subject, type your question, optionally upload an image, and click "Submit Doubt". Our teacher will review and post an answer. You will see the answer under "Your Doubts" with status "Answered".',
  },
  {
    keywords: ['teacher', 'mentor', 'faculty', 'शिक्षक'],
    answer: 'OATH CLASSES is led by experienced and dedicated teachers who make learning easy and focus on concept clarity. You can meet our mentor in the "Meet Our Mentor" section on this page.',
  },
  {
    keywords: ['study material', 'notes', 'material', 'नोट्स', 'स्टडी'],
    answer: 'We provide subject-wise notes, excellent study material, NCERT-based content, and practice material. Visit the "Study Material" section to explore resources by subject. Note: specific PDFs will be made available by the teacher after admission.',
  },
  {
    keywords: ['test', 'exam', 'assessment', 'टेस्ट', 'परीक्षा'],
    answer: 'We conduct regular tests, weekly tests (for NMMS), and full evaluation with performance analysis. Results-oriented learning system ensures you track your progress. Check the "Tests & Practice" section to see available tests.',
  },
  {
    keywords: ['parent', 'parents', 'माता-पिता', 'पेरेंट'],
    answer: 'We conduct regular Parent Meetings and feedback sessions. Personal progress reports are shared. Parents can review their child\'s performance, test results, and teacher feedback directly.',
  },
  {
    keywords: ['contact', 'phone', 'number', 'call', 'address', 'location', 'संपर्क', 'पता', 'फोन'],
    answer: 'Contact OATH CLASSES:\n📞 Phone: 7992056986, 8957372887\n📍 Address: Sai Dham के पास, Puchha Kharela\n\nFeel free to call during business hours for admissions, doubt queries, or a personal visit.',
  },
  {
    keywords: ['address', 'location', 'puchha', 'kharela', 'sai dham', 'जगह'],
    answer: 'OATH CLASSES is located near Sai Dham, Puchha Kharela. Address: Sai Dham के पास, Puchha Kharela.',
  },
  {
    keywords: ['fee', 'fees', 'price', 'cost', 'शुल्क'],
    answer: 'For fee-related information, please contact OATH CLASSES directly at 7992056986 or 8957372887. We will be happy to share all admission details with you.',
  },
  {
    keywords: ['timing', 'time', 'batch', 'schedule', 'समय'],
    answer: 'For batch timings and schedule, please call OATH CLASSES at 7992056986 or 8957372887. We will guide you on the available batches for Class 9, Class 10, and NMMS 2027.',
  },
  {
    keywords: ['result', 'topper', 'selection', 'achievement', 'सफलता', 'परिणाम', 'टॉपर'],
    answer: 'Our results speak: NMMS 2025 — 2 selections, NMMS 2026 — 9 selections, total 11 students selected. Visit the "NMMS Success" and "Our Toppers" sections for more details.',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'हाय'],
    answer: 'नमस्ते! I am the OATH Classes AI Assistant. I can help you with courses, admissions, subjects, doubts, study material, tests, contact info and more. How can I help you today?',
  },
  {
    keywords: ['about', 'who', 'oath classes', 'institute', 'कोचिंग'],
    answer: 'OATH CLASSES is a premier coaching institute dedicated to Class 9 & 10 students along with NMMS / MAT / SAT / FOUNDATION preparation. Our motto: Concept Strong • Marks Sure • Success Guaranteed.',
  },
  {
    keywords: ['answer', 'replied', 'reply'],
    answer: 'Once you submit a doubt, the teacher reviews it and posts an answer. You will see the answer directly under the "Doubt Solving" or "Questions & Answers" section, marked as "Answered". No WhatsApp required — everything happens right here on the platform.',
  },
];

// ============ CONTEXT ============
interface StoreCtx {
  doubts: Doubt[];
  /** Resolves with what really happened on the server: 'saved', 'saved-without-image' (photo upload failed) or 'offline' (nothing reached the backend). */
  addDoubt: (d: Omit<Doubt, 'id' | 'status' | 'createdAt'>) => Promise<'saved' | 'saved-without-image' | 'offline'>;
  answerDoubt: (id: string, answer: string) => void;
  deleteDoubt: (id: string) => void;
  qaItems: QAItem[];
  addQA: (q: Omit<QAItem, 'id' | 'createdAt'>) => void;
  answerQA: (id: string, answer: string) => void;
  deleteQA: (id: string) => void;
  registrations: Registration[];
  addRegistration: (r: Omit<Registration, 'id' | 'status' | 'createdAt'>) => Promise<Registration>;
  setRegistrationStatus: (id: string, status: RegistrationStatus) => void;
  deleteRegistration: (id: string) => void;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
}

const StoreContext = createContext<StoreCtx | null>(null);

/** Server rows -> the shapes the existing UI already renders. */
const toDoubt = (d: ServerDoubt): Doubt => ({
  id: d.id,
  studentName: d.studentName,
  subject: d.subject as Subject,
  question: d.question,
  imageUrl: fileUrl(d.imageUrl),
  status: d.status,
  answer: d.answer,
  answeredAt: d.answeredAt,
  createdAt: d.createdAt,
});
const toQA = (q: ServerQA): QAItem => ({
  id: q.id,
  studentName: q.studentName,
  subject: q.subject as Subject,
  question: q.question,
  answer: q.answer,
  createdAt: q.createdAt,
});
const isLocalId = (id: string) => id.startsWith('doubt-') || id.startsWith('qa-');

const STORAGE_KEY = 'oath_classes_state_v1';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.doubts) setDoubts(parsed.doubts);
        if (parsed.qaItems) setQaItems(parsed.qaItems);
        if (parsed.registrations) setRegistrations(parsed.registrations);
      } else {
        // seed a sample Q&A to demonstrate
        const seed: QAItem[] = [
          {
            id: 'seed-1',
            subject: 'Mathematics',
            question: 'What is the difference between rational and irrational numbers?',
            answer:
              'Rational numbers can be written in the form p/q where p and q are integers and q ≠ 0 (e.g., 3/4, -2, 0.75). Irrational numbers cannot be expressed that way — their decimal expansion is non-terminating and non-repeating (e.g., √2, π, 0.1010010001…). At OATH CLASSES we cover this in Chapter 1 (Class 9) and Number Systems (Class 10).',
            createdAt: Date.now() - 86400000,
          },
          {
            id: 'seed-2',
            subject: 'Science',
            question: 'What is Newton\'s Third Law of Motion?',
            answer:
              'Newton\'s Third Law states: "For every action, there is an equal and opposite reaction." This means when one object exerts a force on a second object, the second object exerts an equal-magnitude force in the opposite direction on the first. Example: when you walk, you push the ground backward and the ground pushes you forward.',
            createdAt: Date.now() - 72000000,
          },
        ];
        setQaItems(seed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist (only after the saved data has been loaded, so it is never overwritten with empty state)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ doubts, qaItems, registrations }));
    } catch {
      // ignore
    }
  }, [hydrated, doubts, qaItems, registrations]);

  // Student site <-> backend sync (best-effort; offline keeps the local copy).
  // 1) Answered Q&A board comes from the server.
  useEffect(() => {
    if (!hydrated) return;
    fetchQna().then((list) => setQaItems(list.map(toQA))).catch(() => {});
  }, [hydrated]);

  // 2) Status / teacher answers for the doubts this browser submitted — refreshed every 30s.
  const doubtsRef = useRef<Doubt[]>([]);
  doubtsRef.current = doubts;
  useEffect(() => {
    if (!hydrated) return;
    let stop = false;
    const refresh = () => {
      const ids = doubtsRef.current.filter((x) => !isLocalId(x.id)).map((x) => x.id);
      if (!ids.length) return;
      fetchMyDoubts(ids)
        .then((fresh) => {
          if (stop || !fresh.length) return;
          const map = new Map(fresh.map((f) => [f.id, toDoubt(f)]));
          setDoubts((prev) => prev.map((x) => map.get(x.id) ?? x));
        })
        .catch(() => {});
    };
    refresh();
    const t = setInterval(refresh, 30000);
    return () => { stop = true; clearInterval(t); };
  }, [hydrated]);

  const addDoubt: StoreCtx['addDoubt'] = (d) => {
    const localId = `doubt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    // Show it instantly (same UI behaviour as before) ...
    setDoubts((prev) => [{ ...d, id: localId, status: 'pending', createdAt: Date.now() }, ...prev]);
    // ... then save it to the backend and swap in the real record.
    return (async () => {
      let imageUrl: string | undefined;
      let imageFailed = false;
      if (d.imageUrl) {
        try {
          imageUrl = await uploadImage(d.imageUrl);
        } catch (err) {
          // Photo could not be uploaded - still send the doubt text so the teacher gets it.
          console.warn('Doubt image upload failed:', err);
          imageFailed = true;
        }
      }
      try {
        const saved = await submitDoubt({ studentName: d.studentName, subject: d.subject, question: d.question, imageUrl });
        setDoubts((prev) => prev.map((x) => (x.id === localId ? toDoubt(saved) : x)));
        return imageFailed ? 'saved-without-image' : 'saved';
      } catch (err) {
        // backend unreachable / rejected: keep the local copy, but tell the student
        console.warn('Doubt submit failed:', err);
        return 'offline';
      }
    })();
  };
  const answerDoubt: StoreCtx['answerDoubt'] = (id, answer) => {
    setDoubts((prev) => prev.map((x) => (x.id === id ? { ...x, answer, status: 'answered', answeredAt: Date.now() } : x)));
  };
  const deleteDoubt: StoreCtx['deleteDoubt'] = (id) => {
    setDoubts((prev) => prev.filter((x) => x.id !== id));
  };
  const addQA: StoreCtx['addQA'] = (q) => {
    setQaItems((prev) => [
      { ...q, id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: Date.now() },
      ...prev,
    ]);
    // Pending questions are hidden on the site until the teacher answers; they reach the admin via the backend.
    submitQuestion({ studentName: q.studentName, subject: q.subject, question: q.question }).catch(() => {});
  };
  const answerQA: StoreCtx['answerQA'] = (id, answer) => {
    setQaItems((prev) => prev.map((x) => (x.id === id ? { ...x, answer } : x)));
  };
  const deleteQA: StoreCtx['deleteQA'] = (id) => {
    setQaItems((prev) => prev.filter((x) => x.id !== id));
  };

  const addRegistration: StoreCtx['addRegistration'] = async (r) => {
    // Try the real backend first (so the registration shows up in the
    // Admin Panel too). If it's unreachable, fall back to a local-only
    // record so the "Registration Successful" confirmation still works.
    try {
      const server = await submitRegistration(r);
      const rec: Registration = {
        studentName: server.studentName,
        guardianName: server.guardianName,
        phone: server.phone,
        email: server.email,
        course: server.course,
        school: server.school,
        address: server.address,
        message: server.message,
        id: server.id,
        status: server.status,
        createdAt: server.createdAt,
      };
      setRegistrations((prev) => [rec, ...prev]);
      return rec;
    } catch {
      const rec: Registration = {
        ...r,
        id: `REG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        status: 'pending',
        createdAt: Date.now(),
      };
      setRegistrations((prev) => [rec, ...prev]);
      return rec;
    }
  };
  const setRegistrationStatus: StoreCtx['setRegistrationStatus'] = (id, status) => {
    setRegistrations((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
  };
  const deleteRegistration: StoreCtx['deleteRegistration'] = (id) => {
    setRegistrations((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{ doubts, addDoubt, answerDoubt, deleteDoubt, qaItems, addQA, answerQA, deleteQA, registrations, addRegistration, setRegistrationStatus, deleteRegistration, isAdmin, setIsAdmin }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// Chatbot response function
export function getChatbotReply(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  for (const entry of KNOWLEDGE) {
    if (entry.keywords.some((k) => msg.includes(k.toLowerCase()))) {
      return entry.answer;
    }
  }
  return 'I don\'t have specific information about that yet, but I can help with admissions, subjects, courses, NMMS, doubt submission, study material, tests, results, or contact details. You can also call OATH CLASSES directly at 7992056986 / 8957372887 for any specific query.';
}
