// MOCK DATA ONLY — replace with API responses later.

export const COURSES = [
  { id: 'C01', name: 'Class 9-10 Foundation', code: '9-10', fee: 12000, duration: '1 Year', subjects: ['Maths', 'Science', 'SST', 'English'], students: 84, status: 'Active' },
  { id: 'C02', name: 'Class 11-12', code: '11-12', fee: 18000, duration: '1 Year', subjects: ['Physics', 'Chemistry', 'Maths', 'Biology'], students: 61, status: 'Active' },
  { id: 'C03', name: 'NMMS', code: 'NMMS', fee: 8000, duration: '8 Months', subjects: ['MAT', 'SAT'], students: 120, status: 'Active' },
  { id: 'C04', name: 'MAT (Mental Ability Test)', code: 'MAT', fee: 5000, duration: '6 Months', subjects: ['Reasoning', 'Logical Ability'], students: 52, status: 'Active' },
  { id: 'C05', name: 'SAT (Scholastic Aptitude Test)', code: 'SAT', fee: 5000, duration: '6 Months', subjects: ['Science', 'Maths', 'Social Science'], students: 47, status: 'Active' },
];

export const BATCHES = [
  { id: 'B01', name: 'NMMS-2027 Morning', number: 'NMMS-27-A', course: 'NMMS', teacher: 'R. K. Verma', schedule: 'Mon-Sat 7:00-9:00 AM', mode: 'Offline', seats: 40, filled: 33, status: 'Running' },
  { id: 'B02', name: 'NMMS-2027 Evening', number: 'NMMS-27-B', course: 'NMMS', teacher: 'Sunita Sharma', schedule: 'Mon-Sat 5:00-7:00 PM', mode: 'Offline', seats: 40, filled: 28, status: 'Running' },
  { id: 'B03', name: 'Foundation 9-10', number: 'FDN-910-A', course: 'Class 9-10 Foundation', teacher: 'Amit Kharela', schedule: 'Mon-Fri 4:00-6:00 PM', mode: 'Hybrid', seats: 35, filled: 30, status: 'Running' },
  { id: 'B04', name: 'Class 11-12 Science', number: 'SCI-1112-A', course: 'Class 11-12', teacher: 'Dr. P. Mishra', schedule: 'Mon-Sat 6:30-9:00 AM', mode: 'Offline', seats: 30, filled: 22, status: 'Running' },
  { id: 'B05', name: 'MAT Crash', number: 'MAT-CR-01', course: 'MAT', teacher: 'Neha Singh', schedule: 'Sat-Sun 10:00-1:00 PM', mode: 'Online', seats: 50, filled: 19, status: 'Upcoming' },
  { id: 'B06', name: 'SAT Crash', number: 'SAT-CR-01', course: 'SAT', teacher: 'R. K. Verma', schedule: 'Sat-Sun 2:00-5:00 PM', mode: 'Online', seats: 50, filled: 24, status: 'Upcoming' },
];

export const STUDENTS = [
  { id: 'STU-1001', name: 'Aarav Gupta', father: 'Ramesh Gupta', mother: 'Sita Gupta', dob: '2011-04-12', gender: 'Male', mobile: '7992056986', whatsapp: '7992056986', email: 'aarav@example.com', city: 'Kharela', state: 'Uttar Pradesh', pin: '210427', school: 'Saraswati Vidya Mandir', prevClass: 'Class 7', course: 'NMMS', batch: 'NMMS-2027 Morning', mode: 'Offline', enrollment: 'Enrolled', joined: '2026-01-08' },
  { id: 'STU-1002', name: 'Priya Yadav', father: 'Suresh Yadav', mother: 'Kamla Yadav', dob: '2010-09-02', gender: 'Female', mobile: '8957372887', whatsapp: '8957372887', email: 'priya@example.com', city: 'Mahoba', state: 'Uttar Pradesh', pin: '210427', school: 'Govt. Inter College', prevClass: 'Class 9', course: 'Class 9-10 Foundation', batch: 'Foundation 9-10', mode: 'Hybrid', enrollment: 'Enrolled', joined: '2026-01-11' },
  { id: 'STU-1003', name: 'Rohit Kushwaha', father: 'Mahesh Kushwaha', mother: 'Rani Devi', dob: '2009-02-21', gender: 'Male', mobile: '9876543210', whatsapp: '9876543210', email: 'rohit@example.com', city: 'Banda', state: 'Uttar Pradesh', pin: '210001', school: 'St. Thomas School', prevClass: 'Class 10', course: 'Class 11-12', batch: 'Class 11-12 Science', mode: 'Offline', enrollment: 'Pending', joined: '2026-02-02' },
  { id: 'STU-1004', name: 'Anjali Sen', father: 'Dinesh Sen', mother: 'Meena Sen', dob: '2011-11-30', gender: 'Female', mobile: '9012345678', whatsapp: '9012345678', email: 'anjali@example.com', city: 'Kharela', state: 'Uttar Pradesh', pin: '210427', school: 'Adarsh Vidyalaya', prevClass: 'Class 7', course: 'MAT', batch: 'MAT Crash', mode: 'Online', enrollment: 'Enrolled', joined: '2026-02-14' },
  { id: 'STU-1005', name: 'Kunal Pal', father: 'Vijay Pal', mother: 'Asha Pal', dob: '2010-06-18', gender: 'Male', mobile: '9123456780', whatsapp: '9123456780', email: 'kunal@example.com', city: 'Charkhari', state: 'Uttar Pradesh', pin: '210421', school: 'Nehru Inter College', prevClass: 'Class 8', course: 'SAT', batch: 'SAT Crash', mode: 'Online', enrollment: 'Inactive', joined: '2025-12-20' },
  { id: 'STU-1006', name: 'Sneha Tiwari', father: 'Arun Tiwari', mother: 'Nisha Tiwari', dob: '2011-01-05', gender: 'Female', mobile: '9988776655', whatsapp: '9988776655', email: 'sneha@example.com', city: 'Kharela', state: 'Uttar Pradesh', pin: '210427', school: 'Saraswati Vidya Mandir', prevClass: 'Class 7', course: 'NMMS', batch: 'NMMS-2027 Evening', mode: 'Offline', enrollment: 'Enrolled', joined: '2026-02-20' },
];

export const REGISTRATIONS = [
  { id: 'REG-2027-001', student: 'Aarav Gupta', course: 'NMMS', batch: 'NMMS-2027 Morning', date: '2026-01-08', mode: 'Offline', status: 'Approved' },
  { id: 'REG-2027-002', student: 'Priya Yadav', course: 'Class 9-10 Foundation', batch: 'Foundation 9-10', date: '2026-01-11', mode: 'Hybrid', status: 'Approved' },
  { id: 'REG-2027-003', student: 'Rohit Kushwaha', course: 'Class 11-12', batch: 'Class 11-12 Science', date: '2026-02-02', mode: 'Offline', status: 'Pending' },
  { id: 'REG-2027-004', student: 'Anjali Sen', course: 'MAT', batch: 'MAT Crash', date: '2026-02-14', mode: 'Online', status: 'Pending' },
  { id: 'REG-2027-005', student: 'Kunal Pal', course: 'SAT', batch: 'SAT Crash', date: '2025-12-20', mode: 'Online', status: 'Rejected' },
  { id: 'REG-2027-006', student: 'Sneha Tiwari', course: 'NMMS', batch: 'NMMS-2027 Evening', date: '2026-02-20', mode: 'Offline', status: 'Approved' },
];

export const TEACHERS = [
  { id: 'T01', name: 'R. K. Verma', email: 'rkverma@oathclasses.in', mobile: '7992056986', qualification: 'M.Sc. Mathematics', experience: '12 yrs', subject: 'MAT / Maths', course: 'NMMS', batch: 'NMMS-2027 Morning', status: 'Active' },
  { id: 'T02', name: 'Sunita Sharma', email: 'sunita@oathclasses.in', mobile: '8957372887', qualification: 'M.A. English', experience: '8 yrs', subject: 'SAT / English', course: 'NMMS', batch: 'NMMS-2027 Evening', status: 'Active' },
  { id: 'T03', name: 'Amit Kharela', email: 'amit@oathclasses.in', mobile: '9876501234', qualification: 'B.Tech', experience: '6 yrs', subject: 'Science', course: 'Class 9-10 Foundation', batch: 'Foundation 9-10', status: 'Active' },
  { id: 'T04', name: 'Dr. P. Mishra', email: 'mishra@oathclasses.in', mobile: '9812345678', qualification: 'Ph.D. Physics', experience: '15 yrs', subject: 'Physics', course: 'Class 11-12', batch: 'Class 11-12 Science', status: 'Active' },
  { id: 'T05', name: 'Neha Singh', email: 'neha@oathclasses.in', mobile: '9700112233', qualification: 'M.Sc. Maths', experience: '4 yrs', subject: 'Reasoning', course: 'MAT', batch: 'MAT Crash', status: 'On Leave' },
];

export const NOTES = [
  { id: 'N01', title: 'Number Series - Practice Set', subject: 'MAT', chapter: 'Series', topic: 'Number Series', course: 'NMMS', batch: 'NMMS-2027 Morning', file: 'mat-series.pdf', published: true, date: '2026-02-01' },
  { id: 'N02', title: 'Light - Reflection & Refraction', subject: 'Science', chapter: 'Chapter 10', topic: 'Reflection', course: 'Class 9-10 Foundation', batch: 'Foundation 9-10', file: 'light-notes.pdf', published: true, date: '2026-02-05' },
  { id: 'N03', title: 'Kinematics Formula Sheet', subject: 'Physics', chapter: 'Motion', topic: 'Kinematics', course: 'Class 11-12', batch: 'Class 11-12 Science', file: 'kinematics.pdf', published: false, date: '2026-02-09' },
  { id: 'N04', title: 'SAT Social Science Capsule', subject: 'SAT', chapter: 'History', topic: 'Revolt 1857', course: 'SAT', batch: 'SAT Crash', file: 'sat-sst.pdf', published: false, date: '2026-02-18' },
];

export const TESTS = [
  { id: 'TS01', title: 'NMMS Weekly Test - 04', course: 'NMMS', batch: 'NMMS-2027 Morning', questions: 90, duration: 90, marks: 90, date: '2026-03-01 09:00', published: true },
  { id: 'TS02', title: 'MAT Reasoning Mock - 01', course: 'MAT', batch: 'MAT Crash', questions: 50, duration: 60, marks: 50, date: '2026-03-03 10:00', published: false },
  { id: 'TS03', title: 'Foundation Science Unit Test', course: 'Class 9-10 Foundation', batch: 'Foundation 9-10', questions: 30, duration: 45, marks: 30, date: '2026-03-05 16:00', published: true },
  { id: 'TS04', title: 'SAT Full Length Mock', course: 'SAT', batch: 'SAT Crash', questions: 90, duration: 90, marks: 90, date: '2026-03-08 14:00', published: false },
];

export const QUESTIONS = [
  { id: 'Q01', text: 'Find the next term: 2, 6, 12, 20, ?', subject: 'MAT', topic: 'Number Series', difficulty: 'Easy', type: 'MCQ', options: ['28', '30', '32', '26'], answer: '30' },
  { id: 'Q02', text: 'Which mirror is used as a rear-view mirror?', subject: 'Science', topic: 'Light', difficulty: 'Easy', type: 'MCQ', options: ['Concave', 'Convex', 'Plane', 'Cylindrical'], answer: 'Convex' },
  { id: 'Q03', text: 'The Revolt of 1857 started from which place?', subject: 'SAT', topic: 'History', difficulty: 'Medium', type: 'MCQ', options: ['Meerut', 'Delhi', 'Kanpur', 'Jhansi'], answer: 'Meerut' },
  { id: 'Q04', text: 'A body moving with uniform acceleration covers...', subject: 'Physics', topic: 'Kinematics', difficulty: 'Hard', type: 'MCQ', options: ['s=ut', 's=ut+½at²', 'v=u/t', 'a=v·t'], answer: 's=ut+½at²' },
];

export const RESULTS = [
  { id: 'R01', student: 'Aarav Gupta', test: 'NMMS Weekly Test - 04', marks: 76, total: 90, percentage: 84.4, remark: 'Excellent', published: true },
  { id: 'R02', student: 'Sneha Tiwari', test: 'NMMS Weekly Test - 04', marks: 68, total: 90, percentage: 75.6, remark: 'Very Good', published: true },
  { id: 'R03', student: 'Anjali Sen', test: 'MAT Reasoning Mock - 01', marks: 31, total: 50, percentage: 62, remark: 'Good', published: false },
  { id: 'R04', student: 'Priya Yadav', test: 'Foundation Science Unit Test', marks: 22, total: 30, percentage: 73.3, remark: 'Good', published: false },
];

export const QUESTION_PAPERS = [
  { id: 'QP01', title: 'NMMS 2026 Previous Year Paper', course: 'NMMS', batch: 'NMMS-2027 Morning', subject: 'MAT + SAT', examDate: '2025-11-10', file: 'nmms-2026.pdf', published: true },
  { id: 'QP02', title: 'Class 10 Science Half Yearly', course: 'Class 9-10 Foundation', batch: 'Foundation 9-10', subject: 'Science', examDate: '2025-09-22', file: 'sci-hy.pdf', published: false },
  { id: 'QP03', title: 'MAT Sample Paper Set-2', course: 'MAT', batch: 'MAT Crash', subject: 'Reasoning', examDate: '2026-01-15', file: 'mat-set2.pdf', published: true },
];

export const DOUBTS: any[] = [];

export const QNA = [
  { id: 'QA01', student: 'Sneha Tiwari', subject: 'NMMS', question: 'When is NMMS 2027 form released?', date: '2026-02-21', answer: '', status: 'Pending' },
  { id: 'QA02', student: 'Rohit Kushwaha', subject: 'Class 11-12', question: 'Is PCB batch available in morning?', date: '2026-02-19', answer: 'Yes, 6:30 AM batch.', status: 'Answered' },
];

export const ANNOUNCEMENTS = [
  { id: 'A01', title: 'NMMS 2027 New Batch Starting Soon', body: 'Limited seats. Admissions open — enroll today at Oath Classes.', course: 'NMMS', batch: 'All', date: '2026-02-01', published: true },
  { id: 'A02', title: 'Weekly Test Schedule Updated', body: 'Weekly tests will now be held every Sunday 9 AM.', course: 'All', batch: 'All', date: '2026-02-12', published: true },
  { id: 'A03', title: 'Holiday Notice', body: 'Classes closed on 8 March.', course: 'All', batch: 'All', date: '2026-02-25', published: false },
];

export const DASHBOARD_STATS = {
  totalStudents: 364,
  newRegistrations: 28,
  teachers: 5,
  courses: 5,
  batches: 6,
  tests: 12,
  pendingDoubts: 2,
  pendingQuestions: 1,
  results: 46,
};
