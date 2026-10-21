// Seed data. Dates are generated relative to "today" so the dashboard always
// looks alive — deadlines are upcoming, events are in the future, and so on.
const { createId, nowIso, dateFromToday: d } = require('../utils/ids');

function buildSeedData() {
  const subjects = [
    { id: 'sub_daa', name: 'Design & Analysis of Algorithms', code: 'CS201', color: 'blue', priority: 'high', targetHours: 30, examDate: d(24) },
    { id: 'sub_dm', name: 'Discrete Mathematics', code: 'MA203', color: 'lavender', priority: 'high', targetHours: 24, examDate: d(27) },
    { id: 'sub_co', name: 'Computer Organization', code: 'CS205', color: 'teal', priority: 'medium', targetHours: 20, examDate: d(31) },
    { id: 'sub_web', name: 'Web Technologies (Hack-o-Week)', code: 'CS209', color: 'amber', priority: 'medium', targetHours: 18, examDate: d(35) },
    { id: 'sub_mcs', name: 'Microcontrollers & Sensors', code: 'EC211', color: 'rose', priority: 'low', targetHours: 14, examDate: d(38) },
  ];

  const session = (subjectId, title, offset, durationMinutes, completed, notes = '') => ({
    id: createId('ses'),
    subjectId,
    title,
    date: d(offset),
    durationMinutes,
    completed,
    notes,
    createdAt: nowIso(),
  });

  const sessions = [
    session('sub_daa', 'Divide & conquer — merge sort recurrences', -9, 90, true, 'Master theorem cases 1–3'),
    session('sub_daa', 'Greedy algorithms: activity selection', -6, 75, true),
    session('sub_daa', 'Dynamic programming: 0/1 knapsack', -3, 120, true, 'Revisit tabulation vs memoisation'),
    session('sub_daa', 'Graph algorithms — Dijkstra & Bellman-Ford', 1, 90, false),
    session('sub_daa', 'Previous year paper (2024)', 5, 180, false),
    session('sub_dm', 'Propositional logic & truth tables', -8, 60, true),
    session('sub_dm', 'Set theory and relations', -4, 90, true),
    session('sub_dm', 'Pigeonhole principle problem set', 2, 60, false),
    session('sub_dm', 'Graph theory: Euler & Hamiltonian paths', 6, 90, false),
    session('sub_co', 'Number systems & IEEE 754', -7, 60, true),
    session('sub_co', 'Pipelining hazards', 0, 75, false, 'Make a one-page summary sheet'),
    session('sub_co', 'Cache mapping techniques', 4, 90, false),
    session('sub_web', 'React hooks deep dive', -5, 90, true),
    session('sub_web', 'Express middleware & routing', -1, 60, true),
    session('sub_web', 'Build CampusConnect demo walkthrough', 3, 120, false),
    session('sub_mcs', 'Arduino digital I/O basics', -2, 60, true),
    session('sub_mcs', 'Ultrasonic sensor wiring in Tinkercad', 7, 75, false),
  ];

  const task = (title, offset, priority, status, extra = {}) => ({
    id: createId('tsk'),
    title,
    description: '',
    dueDate: d(offset),
    priority,
    status,
    subjectId: null,
    tags: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...extra,
  });

  const tasks = [
    task('Submit DAA assignment 3 — DP problems', 1, 'high', 'in-progress', { subjectId: 'sub_daa', description: 'Questions 1–6 from the problem sheet. Upload PDF on the LMS.', tags: ['assignment'] }),
    task('Discrete Maths quiz 2 preparation', 2, 'high', 'todo', { subjectId: 'sub_dm', description: 'Chapters 4 and 5 — relations and functions.', tags: ['quiz'] }),
    task('Hack-o-Week checkpoint: push frontend to GitHub', 3, 'high', 'todo', { subjectId: 'sub_web', description: 'Create a feature branch, open a pull request and request review.', tags: ['project', 'git'] }),
    task('Computer Organization lab record', 4, 'medium', 'todo', { subjectId: 'sub_co', description: 'Experiments 5–7, get signed by lab faculty.', tags: ['lab'] }),
    task('Register for the Inter-college Hackathon', 5, 'medium', 'todo', { tags: ['events'] }),
    task('Microcontrollers mini-project proposal', 8, 'medium', 'todo', { subjectId: 'sub_mcs', description: 'One-page proposal: sensor, circuit and expected output.', tags: ['project'] }),
    task('Pay hostel mess fees', 6, 'low', 'todo', { tags: ['personal'] }),
    task('Update resume with Hack-o-Week project', 12, 'low', 'todo', { tags: ['career'] }),
    task('Read chapter 6 — pipelining', -1, 'medium', 'todo', { subjectId: 'sub_co', tags: ['reading'] }),
    task('DAA assignment 2 — greedy algorithms', -4, 'high', 'done', { subjectId: 'sub_daa', tags: ['assignment'] }),
    task('Set up Node.js and VS Code extensions', -6, 'low', 'done', { subjectId: 'sub_web', tags: ['setup'] }),
    task('Library book return — CLRS', -2, 'low', 'done', { tags: ['personal'] }),
  ];

  const event = (data) => ({
    id: createId('evt'),
    registered: false,
    ...data,
  });

  const events = [
    event({
      title: 'Inter-college Hackathon 2026',
      category: 'Technical',
      date: d(9),
      startTime: '09:00',
      endTime: '21:00',
      venue: 'Innovation Centre, Block C',
      organizer: 'Coding Club',
      capacity: 200,
      attendees: 164,
      summary: '12 hours, teams of four, real problem statements from local startups.',
      description:
        'Build a working prototype in 12 hours. Problem statements are released at 9 AM across three tracks: campus sustainability, student wellbeing and accessible learning. Mentors from partner startups review submissions, and the top three teams win internship interviews. Bring your laptop, charger and student ID — meals are provided.',
      tags: ['coding', 'teams', 'prizes'],
    }),
    event({
      title: 'Git & GitHub Workshop for Beginners',
      category: 'Workshop',
      date: d(3),
      startTime: '14:00',
      endTime: '16:30',
      venue: 'Lab 204, CS Department',
      organizer: 'Open Source Society',
      capacity: 60,
      attendees: 41,
      summary: 'Branches, pull requests and resolving merge conflicts — hands-on.',
      description:
        'A practical session that takes you from your first commit to your first pull request. You will create a repository, work on a feature branch, deliberately cause a merge conflict and fix it, and review a teammate\'s PR. Perfect preparation for the Hack-o-Week submission.',
      tags: ['git', 'beginner-friendly'],
    }),
    event({
      title: 'Resonance — Annual Cultural Fest',
      category: 'Cultural',
      date: d(16),
      startTime: '17:00',
      endTime: '22:00',
      venue: 'Main Amphitheatre',
      organizer: 'Student Council',
      capacity: 1500,
      attendees: 1120,
      summary: 'Live music, dance battles, food stalls and the battle of the bands final.',
      description:
        'The biggest evening of the semester. Catch the battle of the bands final, inter-department dance face-off, a stand-up comedy set and over twenty food stalls run by student clubs. Entry with a valid college ID.',
      tags: ['music', 'dance', 'food'],
    }),
    event({
      title: 'Talk: Life as a Software Engineer at a Global Tech Company',
      category: 'Career',
      date: d(6),
      startTime: '11:00',
      endTime: '12:30',
      venue: 'Seminar Hall 1',
      organizer: 'Training & Placement Cell',
      capacity: 180,
      attendees: 97,
      summary: 'An alumna shares how she prepared for interviews and what the job is really like.',
      description:
        'A candid conversation with an alumna working as a software engineer abroad. Topics include building a strong project portfolio in second year, preparing for data-structures interviews, internships and what day-to-day engineering work looks like. Live Q&A at the end.',
      tags: ['placements', 'alumni'],
    }),
    event({
      title: 'Inter-department Football League',
      category: 'Sports',
      date: d(11),
      startTime: '16:00',
      endTime: '19:00',
      venue: 'College Ground',
      organizer: 'Sports Committee',
      capacity: 300,
      attendees: 120,
      summary: 'CSE vs Mechanical — come cheer for your department.',
      description:
        'Group stage match of the inter-department league. Players must report by 3:30 PM in department jerseys. Spectators welcome; water and first aid available at the pavilion.',
      tags: ['football', 'outdoor'],
    }),
    event({
      title: 'Arduino & IoT Build Night',
      category: 'Workshop',
      date: d(13),
      startTime: '18:00',
      endTime: '21:00',
      venue: 'Electronics Lab, Block B',
      organizer: 'Robotics Club',
      capacity: 40,
      attendees: 38,
      summary: 'Wire up sensors and build a mini weather station. Kits provided.',
      description:
        'Work in pairs to build a temperature and humidity monitor using an Arduino Uno, a DHT11 sensor and an LCD display. Great practice for the Microcontrollers & Sensors course project. All components are provided — just bring a laptop with the Arduino IDE installed.',
      tags: ['hardware', 'iot', 'hands-on'],
    }),
    event({
      title: 'Photography Club Photowalk',
      category: 'Club',
      date: d(19),
      startTime: '06:30',
      endTime: '09:00',
      venue: 'Meet at Main Gate',
      organizer: 'Lens & Light Club',
      capacity: 35,
      attendees: 22,
      summary: 'Golden-hour walk around the old city. Phones welcome.',
      description:
        'A relaxed morning photowalk focused on composition and natural light. Club seniors will share quick tips on framing and editing. Any camera, including a phone, is fine.',
      tags: ['photography', 'outdoors'],
    }),
    event({
      title: 'Mock Coding Interview Marathon',
      category: 'Career',
      date: d(21),
      startTime: '10:00',
      endTime: '16:00',
      venue: 'CS Department, Labs 201–203',
      organizer: 'Coding Club',
      capacity: 80,
      attendees: 80,
      summary: 'Timed 45-minute mock interviews with seniors and feedback forms.',
      description:
        'Pair up with final-year students for realistic mock interviews: one data-structures problem, one discussion on a project of yours, and written feedback. Slots are first come, first served.',
      tags: ['interviews', 'dsa'],
    }),
  ];
  // One event already registered so the "My registrations" view is not empty.
  events[1].registered = true;

  const resource = (title, category, type, url, description, level = 'Beginner') => ({
    id: createId('res'),
    title,
    category,
    type,
    url,
    description,
    level,
  });

  const resources = [
    resource('MDN Web Docs — Learn web development', 'Web Development', 'Documentation', 'https://developer.mozilla.org/en-US/docs/Learn', 'The reference for HTML, CSS and JavaScript, with beginner-friendly guided modules.'),
    resource('React — Official documentation', 'Web Development', 'Documentation', 'https://react.dev/learn', 'Components, hooks and state management explained with interactive examples.', 'Intermediate'),
    resource('Express.js Guide', 'Web Development', 'Documentation', 'https://expressjs.com/en/guide/routing.html', 'Routing, middleware and error handling for Node.js servers.', 'Intermediate'),
    resource('Node.js — Learn', 'Web Development', 'Documentation', 'https://nodejs.org/en/learn', 'The official introduction to the Node.js runtime, modules and the event loop.'),
    resource('CSS Flexbox & Grid — web.dev Learn CSS', 'Web Development', 'Course', 'https://web.dev/learn/css', 'A structured CSS course covering layout, custom properties and responsive design.'),
    resource('VisuAlgo — Visualising algorithms', 'Algorithms', 'Interactive', 'https://visualgo.net/en', 'Step through sorting, graph and tree algorithms with animations.'),
    resource('CP-Algorithms', 'Algorithms', 'Reference', 'https://cp-algorithms.com/', 'Clear write-ups of classic algorithms with complexity analysis and code.', 'Advanced'),
    resource('MIT OCW 6.006 — Introduction to Algorithms', 'Algorithms', 'Course', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', 'Full lecture videos, notes and problem sets from MIT.', 'Intermediate'),
    resource('MIT OCW 6.042J — Mathematics for Computer Science', 'Mathematics', 'Course', 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/', 'Proofs, sets, graph theory, counting and probability for CS students.', 'Intermediate'),
    resource('Khan Academy — Computer Science', 'Mathematics', 'Course', 'https://www.khanacademy.org/computing/computer-science', 'Gentle introductions to algorithms, cryptography and information theory.'),
    resource('Pro Git Book', 'Tools', 'Book', 'https://git-scm.com/book/en/v2', 'The free, complete book on Git — branching, merging and workflows.'),
    resource('GitHub Skills', 'Tools', 'Interactive', 'https://skills.github.com/', 'Short, hands-on courses that run inside real GitHub repositories.'),
    resource('Tinkercad Circuits', 'Tools', 'Interactive', 'https://www.tinkercad.com/circuits', 'Simulate Arduino circuits in the browser before building them physically.'),
    resource('roadmap.sh — Developer roadmaps', 'Career', 'Guide', 'https://roadmap.sh/', 'Community roadmaps for frontend, backend and full-stack learning paths.'),
    resource('The Odin Project', 'Career', 'Course', 'https://www.theodinproject.com/', 'A free full-stack curriculum built around real projects and portfolio work.', 'Intermediate'),
  ];

  const profile = {
    name: 'Priyanka Wanjari',
    email: 'priyanka.wanjari@student.example.edu',
    program: 'B.Tech Computer Science & Engineering',
    year: 2,
    semester: 3,
    rollNumber: 'CSE-24-047',
    bio: 'Second-year CSE student who enjoys building web apps and learning algorithms.',
    interests: ['Web Development', 'Algorithms', 'Open Source'],
    preferences: {
      weeklyStudyGoalHours: 12,
      showCompletedTasks: true,
      confirmDeletes: true,
      compactMode: false,
      startPage: '/',
    },
    updatedAt: nowIso(),
  };

  const activity = [
    { id: createId('act'), type: 'task', message: 'Completed “DAA assignment 2 — greedy algorithms”', at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
    { id: createId('act'), type: 'study', message: 'Logged 60 min — Express middleware & routing', at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
    { id: createId('act'), type: 'event', message: 'Registered for Git & GitHub Workshop for Beginners', at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
    { id: createId('act'), type: 'task', message: 'Started “Submit DAA assignment 3 — DP problems”', at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  ];

  const announcements = [
    { id: 'ann_1', title: 'Mid-semester exams timetable published', body: 'Check the exam cell notice board or the LMS for room allocations.', date: d(-1), level: 'info' },
    { id: 'ann_2', title: 'Hack-o-Week final submissions', body: 'Projects must be pushed to GitHub with a README before the final review.', date: d(-2), level: 'important' },
    { id: 'ann_3', title: 'Library open till midnight', body: 'Extended hours during exam season, Monday to Saturday.', date: d(-3), level: 'info' },
  ];

  return {
    meta: { version: 1, seededAt: nowIso() },
    profile,
    subjects,
    sessions,
    tasks,
    events,
    resources,
    announcements,
    activity,
    feedback: [],
  };
}

module.exports = { buildSeedData };
