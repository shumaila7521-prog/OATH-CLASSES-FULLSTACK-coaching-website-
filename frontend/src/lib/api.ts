/**
 * Public-site API client. Only the endpoints the student website actually
 * needs to call are here (registration, doubts, Q&A and the published
 * notes / papers / tests / announcements lists). No login is used.
 * Every call is best-effort — if the backend is unreachable, the caller
 * falls back to local-only behaviour so the site still works.
 *
 * Configure the backend URL via VITE_API_BASE_URL (see .env.example).
 */

export const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL ?? '/api';

export interface ServerRegistration {
  id: string;
  studentName: string;
  guardianName: string;
  phone: string;
  email: string;
  course: string;
  batch?: string;
  school: string;
  address: string;
  message: string;
  mode?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface RegistrationInput {
  studentName: string;
  guardianName: string;
  phone: string;
  email: string;
  course: string;
  school: string;
  address: string;
  message: string;
}

/**
 * Sends the Enroll Now form to the backend so it shows up in the Admin
 * Panel's Registrations list. Throws on failure — the caller decides how
 * to fall back (see lib/store.tsx#addRegistration).
 */
export async function submitRegistration(data: RegistrationInput): Promise<ServerRegistration> {
  const res = await fetch(`${API_BASE_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Registration failed (${res.status})`);
  }
  return res.json();
}

/* =====================================================================
   STEP 3 — public endpoints (/api/public/*) and image upload
   ===================================================================== */

/** Backend serves uploaded files from its own origin (API_BASE_URL minus "/api"). */
export const FILE_BASE_URL: string = API_BASE_URL.replace(/\/api\/?$/, '');

/** Turns "/uploads/abc.png" (as stored in the DB) into a full URL the <img>/<a> can load. */
export function fileUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return /^https?:|^data:/.test(path) ? path : `${FILE_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export interface ServerDoubt {
  id: string;
  studentName: string;
  subject: string;
  topic: string;
  question: string;
  imageUrl?: string; // "/uploads/..." — pass through fileUrl() before rendering
  status: 'pending' | 'answered';
  answer?: string;
  answeredAt?: number;
  createdAt: number;
}

export interface ServerQA {
  id: string;
  studentName: string;
  subject: string;
  question: string;
  answer?: string;
  createdAt: number;
}

export interface DoubtInput {
  studentName: string;
  subject: string;
  topic?: string;
  question: string;
  imageUrl?: string; // must be the URL returned by uploadImage()
}

/**
 * Phone photos are often 4-12 MB (or HEIC/WEBP). Re-encode anything big or not jpg/png
 * to a <=1600px JPEG so the upload is small and always accepted. Falls back to the
 * original file if the browser cannot decode it.
 */
async function shrinkImage(blob: Blob): Promise<Blob> {
  const isJpgPng = /^image\/(jpeg|png)$/.test(blob.type);
  if (isJpgPng && blob.size <= 1_500_000) return blob;
  try {
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const out = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (!out) return blob;
    return isJpgPng && out.size >= blob.size ? blob : out;
  } catch {
    return blob;
  }
}

/** Uploads a question photo (max 10 MB). Accepts a File or a data: URL from FileReader. */
export async function uploadImage(file: File | string): Promise<string> {
  let blob: Blob;
  if (typeof file === 'string') {
    blob = await (await fetch(file)).blob(); // data: URL -> Blob
  } else {
    blob = file;
  }
  blob = await shrinkImage(blob);
  const ext = blob.type === 'image/png' ? 'png' : 'jpg';
  const form = new FormData();
  form.append('file', blob, `doubt.${ext}`);
  const res = await fetch(`${API_BASE_URL}/upload/image`, { method: 'POST', body: form });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.error || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  return data.url as string;
}

export const submitDoubt = (data: DoubtInput) => postJson<ServerDoubt>('/public/doubts', data);

export const deleteDoubtApi = (id: string) =>
  fetch(`${API_BASE_URL}/public/doubts/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});

/** Current status/answer of doubts this browser submitted earlier (by their ids). */
export const fetchMyDoubts = (ids: string[]) =>
  ids.length ? getJson<ServerDoubt[]>(`/public/doubts?ids=${encodeURIComponent(ids.join(','))}`) : Promise.resolve([]);

export const submitQuestion = (data: { studentName?: string; subject: string; question: string }) =>
  postJson<ServerQA>('/public/qna', data);

/** Answered questions only. */
export const fetchQna = () => getJson<ServerQA[]>('/public/qna');

/* Read-only lists — the backend returns PUBLISHED rows only. */
export interface PublicNote { id: string; title: string; subject?: string; chapter?: string; topic?: string; course?: string; batch?: string; file?: string; date: string }
export interface PublicPaper { id: string; title: string; course?: string; batch?: string; subject?: string; examDate?: string; file?: string }
export interface PublicTest { id: string; title: string; course?: string; batch?: string; questions?: number; duration?: number; marks?: number; date?: string }
export interface PublicAnnouncement { id: string; title: string; body: string; course?: string; batch?: string; date: string }

export const fetchNotes = () => getJson<PublicNote[]>('/public/notes');
export const fetchPapers = () => getJson<PublicPaper[]>('/public/papers');
export const fetchTests = () => getJson<PublicTest[]>('/public/tests');
export const fetchAnnouncements = () => getJson<PublicAnnouncement[]>('/public/announcements');
