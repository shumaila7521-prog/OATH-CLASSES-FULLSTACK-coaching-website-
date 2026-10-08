/**
 * Oath Classes — Admin Panel FRONTEND API service layer.
 * No backend logic here. Every function is a thin wrapper around fetch()
 * that the backend team can point at real endpoints later.
 *
 * Configure the base URL via env:  VITE_API_BASE_URL=https://api.example.com
 */

import * as mock from '../mock';

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? '/api';

export const FILE_BASE_URL: string = API_BASE_URL.replace(/\/api\/?$/, '');

export function fileUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return /^https?:|^data:/.test(path) ? path : `${FILE_BASE_URL}${path}`;
}

export const USE_MOCK =
  ((import.meta as any).env?.VITE_USE_MOCK ?? 'false') === 'true';

function authHeader(): Record<string, string> {
  const token = sessionStorage.getItem('oath_admin_token'); // session only, not persistent storage
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Generic request helper.
 * - VITE_USE_MOCK=true  -> returns the mock data (demo mode, no backend).
 * - otherwise           -> talks to the real backend and THROWS on any failure.
 *   (Before, failures were silently swapped for mock data, so the panel looked
 *   "saved"/"empty" while nothing reached the database.)
 * Failures are also broadcast so App.tsx can show a toast / send you back to login.
 */
async function request<T>(path: string, options: RequestInit = {}, fallback?: T): Promise<T> {
  if (USE_MOCK && fallback !== undefined) {
    await new Promise((r) => setTimeout(r, 450));
    return fallback;
  }
  const notify = (name: string, message: string) =>
    window.dispatchEvent(new CustomEvent(name, { detail: message }));
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers || {}) },
      ...options,
    });
  } catch {
    const msg = `Cannot reach the server (${API_BASE_URL}). Is the backend running?`;
    notify('oath-api-error', msg);
    throw new Error(msg);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as any));
    const msg = body.error || `Request failed (${res.status})`;
    // 401 on a non-login call = missing/expired/mock token -> back to login
    if (res.status === 401 && !path.startsWith('/auth/')) notify('oath-auth-expired', msg);
    else if (!path.startsWith('/auth/')) notify('oath-api-error', msg);
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

const GET = <T,>(p: string, fb?: T) => request<T>(p, { method: 'GET' }, fb);
const POST = <T,>(p: string, body?: unknown, fb?: T) =>
  request<T>(p, { method: 'POST', body: JSON.stringify(body ?? {}) }, fb);
const PUT = <T,>(p: string, body?: unknown, fb?: T) =>
  request<T>(p, { method: 'PUT', body: JSON.stringify(body ?? {}) }, fb);
const DEL = <T,>(p: string, fb?: T) => request<T>(p, { method: 'DELETE' }, fb);

const ok = { success: true } as const;

/* ---------------- Auth (UI only) ---------------- */
export const adminLogin = (email: string, password: string) =>
  POST('/auth/admin/login', { email, password }, { token: 'mock-admin-token', role: 'admin', name: 'Admin' });
export const teacherLogin = (email: string, password: string) =>
  POST('/auth/teacher/login', { email, password }, { token: 'mock-teacher-token', role: 'teacher', name: 'Teacher' });
export const logout = () => POST('/auth/logout', {}, ok);

/* ---------------- Dashboard ---------------- */
export const getDashboardStats = () => GET('/dashboard/stats', mock.DASHBOARD_STATS);

/* ---------------- Students ---------------- */
export const getStudents = (params?: Record<string, string>) =>
  GET(`/students${params ? `?${new URLSearchParams(params)}` : ''}`, mock.STUDENTS);
export const getStudent = (id: string) =>
  GET(`/students/${id}`, mock.STUDENTS.find((s) => s.id === id)!);
export const updateStudent = (id: string, data: unknown) => PUT(`/students/${id}`, data, ok);

/* ---------------- Registrations ---------------- */
export const getRegistrations = () => GET('/registrations', mock.REGISTRATIONS);
export const approveRegistration = (id: string) => POST(`/registrations/${id}/approve`, {}, ok);
export const rejectRegistration = (id: string) => POST(`/registrations/${id}/reject`, {}, ok);
export const updateRegistration = (id: string, data: unknown) => PUT(`/registrations/${id}`, data, ok);
/** Used by the Student Website registration form. */
export const registerStudent = (data: unknown) => POST('/registrations', data, ok);

/* ---------------- Teachers ---------------- */
export const getTeachers = () => GET('/teachers', mock.TEACHERS);
export const createTeacher = (d: unknown) => POST('/teachers', d, ok);
export const updateTeacher = (id: string, d: unknown) => PUT(`/teachers/${id}`, d, ok);
export const deleteTeacher = (id: string) => DEL(`/teachers/${id}`, ok);

/* ---------------- Courses ---------------- */
export const getCourses = () => GET('/courses', mock.COURSES);
export const createCourse = (d: unknown) => POST('/courses', d, ok);
export const updateCourse = (id: string, d: unknown) => PUT(`/courses/${id}`, d, ok);

/* ---------------- Batches ---------------- */
export const getBatches = () => GET('/batches', mock.BATCHES);
export const createBatch = (d: unknown) => POST('/batches', d, ok);
export const updateBatch = (id: string, d: unknown) => PUT(`/batches/${id}`, d, ok);

/* ---------------- Notes ---------------- */
export const getNotes = () => GET('/notes', mock.NOTES);
export const uploadNote = (d: unknown) => POST('/notes', d, ok);
export const updateNote = (id: string, d: unknown) => PUT(`/notes/${id}`, d, ok);
export const deleteNote = (id: string) => DEL(`/notes/${id}`, ok);
export const publishNote = (id: string, published: boolean) => PUT(`/notes/${id}/publish`, { published }, ok);

/* ---------------- Tests ---------------- */
export const getTests = () => GET('/tests', mock.TESTS);
export const createTest = (d: unknown) => POST('/tests', d, ok);
export const updateTest = (id: string, d: unknown) => PUT(`/tests/${id}`, d, ok);
export const deleteTest = (id: string) => DEL(`/tests/${id}`, ok);
export const publishTest = (id: string, published: boolean) => PUT(`/tests/${id}/publish`, { published }, ok);

/* ---------------- Question Bank ---------------- */
export const getQuestionBank = () => GET('/question-bank', mock.QUESTIONS);
export const createQuestion = (d: unknown) => POST('/question-bank', d, ok);
export const updateQuestion = (id: string, d: unknown) => PUT(`/question-bank/${id}`, d, ok);

/* ---------------- Results ---------------- */
export const getResults = () => GET('/results', mock.RESULTS);
export const publishResult = (id: string) => POST(`/results/${id}/publish`, {}, ok);

/* ---------------- Question Papers ---------------- */
export const getQuestionPapers = () => GET('/question-papers', mock.QUESTION_PAPERS);
export const uploadQuestionPaper = (d: unknown) => POST('/question-papers', d, ok);
export const publishQuestionPaper = (id: string, published: boolean) =>
  PUT(`/question-papers/${id}/publish`, { published }, ok);

/* ---------------- Doubts ---------------- */
export const getDoubts = () => GET('/doubts', mock.DOUBTS);
export const answerDoubt = (id: string, answer: string) => POST(`/doubts/${id}/answer`, { answer }, ok);
export const deleteDoubt = (id: string) => DEL(`/doubts/${id}`, ok);

/* ---------------- Q&A ---------------- */
export const getQuestions = () => GET('/qna', mock.QNA);
export const answerQuestion = (id: string, answer: string) => POST(`/qna/${id}/answer`, { answer }, ok);

/* ---------------- Announcements ---------------- */
export const getAnnouncements = () => GET('/announcements', mock.ANNOUNCEMENTS);
export const createAnnouncement = (d: unknown) => POST('/announcements', d, ok);
export const updateAnnouncement = (id: string, d: unknown) => PUT(`/announcements/${id}`, d, ok);
export const deleteAnnouncement = (id: string) => DEL(`/announcements/${id}`, ok);
export const publishAnnouncement = (id: string, published: boolean) =>
  PUT(`/announcements/${id}/publish`, { published }, ok);
