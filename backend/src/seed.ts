import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './lib/db';

async function upsertUser(email: string, password: string, name: string, role: 'admin' | 'teacher') {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO admin_users (email, password, name, role) VALUES ($1,$2,$3,$4)
     ON CONFLICT (email) DO NOTHING`,
    [email, hash, name, role]
  );
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@oathclasses.in';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const teacherEmail = process.env.SEED_TEACHER_EMAIL || 'teacher@oathclasses.in';
  const teacherPassword = process.env.SEED_TEACHER_PASSWORD || 'teacher123';

  await upsertUser(adminEmail, adminPassword, 'Admin', 'admin');
  await upsertUser(teacherEmail, teacherPassword, 'Teacher', 'teacher');

  const { rows: courseRows } = await pool.query('SELECT COUNT(*)::int AS n FROM courses');
  if (courseRows[0].n === 0) {
    await pool.query(
      `INSERT INTO courses (name, code, fee, duration, subjects, students, status) VALUES
       ('Class 9-10 Foundation','9-10',12000,'1 Year',ARRAY['Maths','Science','SST','English'],84,'Active'),
       ('Class 11-12','11-12',18000,'1 Year',ARRAY['Physics','Chemistry','Maths','Biology'],61,'Active'),
       ('NMMS','NMMS',8000,'8 Months',ARRAY['MAT','SAT'],120,'Active'),
       ('MAT (Mental Ability Test)','MAT',5000,'6 Months',ARRAY['Reasoning','Logical Ability'],52,'Active'),
       ('SAT (Scholastic Aptitude Test)','SAT',5000,'6 Months',ARRAY['Science','Maths','Social Science'],47,'Active')`
    );
  }

  const { rows: teacherRows } = await pool.query('SELECT COUNT(*)::int AS n FROM teachers');
  if (teacherRows[0].n === 0) {
    await pool.query(
      `INSERT INTO teachers (name, email, mobile, qualification, experience, subject, course, batch, status) VALUES
       ('R. K. Verma','rkverma@oathclasses.in','7992056986','M.Sc. Mathematics','12 yrs','MAT / Maths','NMMS','NMMS-2027 Morning','Active'),
       ('Sunita Sharma','sunita@oathclasses.in','8957372887','M.A. English','8 yrs','SAT / English','NMMS','NMMS-2027 Evening','Active'),
       ('Amit Kharela','amit@oathclasses.in','9876501234','B.Tech','6 yrs','Science','Class 9-10 Foundation','Foundation 9-10','Active')`
    );
  }

  const { rows: batchRows } = await pool.query('SELECT COUNT(*)::int AS n FROM batches');
  if (batchRows[0].n === 0) {
    await pool.query(
      `INSERT INTO batches (name, number, course, teacher, schedule, mode, seats, filled, status) VALUES
       ('NMMS-2027 Morning','NMMS-27-A','NMMS','R. K. Verma','Mon-Sat 7:00-9:00 AM','Offline',40,33,'Running'),
       ('NMMS-2027 Evening','NMMS-27-B','NMMS','Sunita Sharma','Mon-Sat 5:00-7:00 PM','Offline',40,28,'Running'),
       ('Foundation 9-10','FDN-910-A','Class 9-10 Foundation','Amit Kharela','Mon-Fri 4:00-6:00 PM','Hybrid',35,30,'Running')`
    );
  }

  console.log('Seed complete.');
  console.log(`Admin login:   ${adminEmail} / ${adminPassword}`);
  console.log(`Teacher login: ${teacherEmail} / ${teacherPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
