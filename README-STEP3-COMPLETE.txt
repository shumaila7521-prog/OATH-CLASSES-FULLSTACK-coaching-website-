OATH CLASSES — STEP 3 COMPLETE

Student frontend:
- Study Material no longer uses hardcoded demo resources.
- Published Notes and Question Papers are loaded from /api/public/notes and /api/public/papers.
- Preview/Download buttons use the backend file URL when a file is uploaded.
- Published Tests are loaded from /api/public/tests.
- No frontend layout/design was changed.

Run:
1. Backend:
   cd backend
   npm install
   npm run migrate
   npm run dev

2. Frontend:
   cd frontend
   npm install
   Set VITE_API_BASE_URL=http://localhost:5000/api
   npm run dev

Admin must publish a note, question paper, or test for it to appear on the student site.
