import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './src/routes/auth';
import dashboardRoutes from './src/routes/dashboard';
import studentsRoutes from './src/routes/students';
import registrationsRoutes from './src/routes/registrations';
import teachersRoutes from './src/routes/teachers';
import coursesRoutes from './src/routes/courses';
import batchesRoutes from './src/routes/batches';
import notesRoutes from './src/routes/notes';
import testsRoutes from './src/routes/tests';
import questionBankRoutes from './src/routes/questionBank';
import resultsRoutes from './src/routes/results';
import questionPapersRoutes from './src/routes/questionPapers';
import doubtsRoutes from './src/routes/doubts';
import qnaRoutes from './src/routes/qna';
import announcementsRoutes from './src/routes/announcements';
import publicRoutes from './src/routes/public';
import uploadRoutes, { UPLOAD_DIR } from './src/routes/upload';

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true }));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/question-bank', questionBankRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/question-papers', questionPapersRoutes);
app.use('/api/doubts', doubtsRoutes);
app.use('/api/qna', qnaRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);

async function runTest() {
  const server = app.listen(5099);
  const BASE = 'http://localhost:5099/api';

  console.log('🚀 Starting Verification Tests...\n');

  try {
    // 1. Admin Login
    console.log('1. Testing Admin Login...');
    const loginRes = await fetch(`${BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@oathclasses.in', password: 'admin123' }),
    });
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Admin login successful! Token received.');

    // 2. Student Image Upload
    console.log('\n2. Testing Student Doubt Image Upload (POST /api/upload/image)...');
    // create fake PNG buffer
    const pngHeader = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d420000000049454e44ae426082', 'hex');
    const form = new FormData();
    form.append('file', new Blob([pngHeader], { type: 'image/png' }), 'doubt.png');
    const uploadRes = await fetch(`${BASE}/upload/image`, { method: 'POST', body: form });
    if (!uploadRes.ok) throw new Error(`Image upload failed: ${uploadRes.status}`);
    const uploadData = await uploadRes.json();
    console.log(`✅ Image uploaded successfully! URL: ${uploadData.url}`);

    // 3. Student Submit Doubt with Attachment
    console.log('\n3. Testing Student Submit Doubt (POST /api/public/doubts)...');
    const doubtRes = await fetch(`${BASE}/public/doubts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Rahul Sharma',
        subject: 'Mathematics',
        topic: 'Quadratic Equations',
        question: 'How to solve x^2 - 5x + 6 = 0 using factorization?',
        imageUrl: uploadData.url,
      }),
    });
    if (!doubtRes.ok) throw new Error(`Doubt submit failed: ${await doubtRes.text()}`);
    const doubtData = await doubtRes.json();
    console.log(`✅ Student doubt submitted! ID: ${doubtData.id}, Status: ${doubtData.status}`);

    // 4. Admin Panel Fetches Doubts
    console.log('\n4. Testing Admin Panel Doubt Retrieval (GET /api/doubts)...');
    const adminDoubtsRes = await fetch(`${BASE}/doubts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const adminDoubts = await adminDoubtsRes.json();
    const foundDoubt = adminDoubts.find((d: any) => d.id === doubtData.id);
    if (!foundDoubt) throw new Error('Submitted doubt not found in Admin Panel!');
    console.log(`✅ Doubt visible in Admin Panel! Student: ${foundDoubt.student}, Attachment: ${foundDoubt.attachment}`);

    // 5. Admin/Teacher Answers Doubt
    console.log('\n5. Testing Teacher Answers Doubt (POST /api/doubts/:id/answer)...');
    const answerRes = await fetch(`${BASE}/doubts/${doubtData.id}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answer: 'Split -5x into -2x and -3x: (x-2)(x-3) = 0, so x = 2 or x = 3.' }),
    });
    if (!answerRes.ok) throw new Error(`Answer doubt failed: ${answerRes.status}`);
    console.log('✅ Teacher answer posted successfully!');

    // 6. Student Checks Doubt Answer
    console.log('\n6. Testing Student Fetch My Doubts (GET /api/public/doubts?ids=...)...');
    const myDoubtsRes = await fetch(`${BASE}/public/doubts?ids=${doubtData.id}`);
    const myDoubts = await myDoubtsRes.json();
    if (!myDoubts[0] || myDoubts[0].status !== 'answered') {
      throw new Error(`Student did not receive answered doubt! Status: ${myDoubts[0]?.status}`);
    }
    console.log(`✅ Student received answer! Status: ${myDoubts[0].status}, Answer: "${myDoubts[0].answer}"`);

    // 7. Student Submit Registration Form
    console.log('\n7. Testing Student Registration Form (POST /api/registrations)...');
    const regRes = await fetch(`${BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Ananya Verma',
        guardianName: 'Suresh Verma',
        phone: '9876543210',
        email: 'ananya@gmail.com',
        course: 'Class 9-10 Foundation',
        school: 'DPS Public School',
        address: 'Kharela',
        message: 'Interested in morning batch',
      }),
    });
    if (!regRes.ok) throw new Error(`Registration failed: ${await regRes.text()}`);
    const regData = await regRes.json();
    console.log(`✅ Registration submitted! ID: ${regData.id}`);

    // 8. Admin Panel Fetches Registrations & Approves
    console.log('\n8. Testing Admin Panel Registrations & Approval...');
    const adminRegsRes = await fetch(`${BASE}/registrations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const adminRegs = await adminRegsRes.json();
    const foundReg = adminRegs.find((r: any) => r.id === regData.id);
    if (!foundReg) throw new Error('Registration not found in Admin Panel!');
    console.log(`✅ Registration visible in Admin Panel! Student: ${foundReg.student}`);

    const approveRes = await fetch(`${BASE}/registrations/${regData.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!approveRes.ok) throw new Error('Approval failed!');
    console.log('✅ Admin registration approved!');

    // 9. Admin Uploads Note & Publishes to Student Site
    console.log('\n9. Testing Admin Note Creation & Publishing to Frontend...');
    const noteRes = await fetch(`${BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Class 10 Science Formula Sheet', subject: 'Science', chapter: 'Light', course: 'Class 9-10 Foundation', published: false }),
    });
    const noteData = await noteRes.json();

    // Check before publish
    const publicNotesBefore = await (await fetch(`${BASE}/public/notes`)).json();
    if (publicNotesBefore.some((n: any) => n.id === noteData.id)) throw new Error('Unpublished note should not appear in public list!');

    // Publish note
    await fetch(`${BASE}/notes/${noteData.id}/publish`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: true }),
    });

    // Check after publish
    const publicNotesAfter = await (await fetch(`${BASE}/public/notes`)).json();
    const publishedNote = publicNotesAfter.find((n: any) => n.id === noteData.id);
    if (!publishedNote) throw new Error('Published note not appearing on student frontend!');
    console.log(`✅ Admin Note published and visible on Student Frontend! Title: "${publishedNote.title}"`);

    // 10. Admin Announcement & Publishing
    console.log('\n10. Testing Announcement Creation & Publishing...');
    const annRes = await fetch(`${BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'NMMS 2027 Mock Test Scheduled', body: 'Mock test will be conducted this Sunday at 10 AM.', course: 'NMMS', published: true }),
    });
    const annData = await annRes.json();
    const publicAnn = await (await fetch(`${BASE}/public/announcements`)).json();
    if (!publicAnn.some((a: any) => a.id === annData.id)) throw new Error('Announcement not visible on student site!');
    console.log(`✅ Announcement published and visible on Student Frontend! Title: "${annData.title}"`);

    console.log('\n==================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED 100% SUCCESSFULLY!');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('\n❌ Test failed with error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTest();
