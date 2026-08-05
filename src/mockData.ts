import type { Coach, Session, StudentGoal } from './types';
import { calculateTrustScore } from './trustCalculator';

export const INITIAL_COACHES: Coach[] = [
  {
    id: 'coach-1',
    name: 'Aravind Sharma',
    specialty: ['DSA', 'System Design', 'Mock Interviews'],
    bio: 'Ex-Staff Engineer at Google & tech lead at Uber. Over 10 years of industry experience. I specialize in helping mid-level engineers level up to senior roles and helping graduates crack FAANG interviews.',
    pricePerSession: 1500,
    avatar: 'AS',
    certificates: ['Google Staff Engineering Certification', 'AWS Certified Solutions Architect - Professional'],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // mock playable video
    placements: [
      {
        id: 'p-1',
        studentName: 'Rohan Mehta',
        companyName: 'Google',
        role: 'Software Engineer L4',
        proofLink: 'https://linkedin.com/in/mock-rohan-google-proof'
      },
      {
        id: 'p-2',
        studentName: 'Priya Patel',
        companyName: 'Amazon',
        role: 'SDE 2',
        proofLink: 'https://linkedin.com/in/mock-priya-amazon-proof'
      },
      {
        id: 'p-3',
        studentName: 'Amit Verma',
        companyName: 'Microsoft',
        role: 'SDE 1',
        proofLink: 'https://linkedin.com/in/mock-amit-microsoft-proof'
      }
    ],
    reviews: [
      {
        id: 'r-1',
        studentName: 'Rohan Mehta',
        rating: 5,
        comment: 'Aravind\'s mock interviews are identical to Google\'s actual loops. His feedback on my coding speed and system design scaling was what got me the offer.',
        date: '2026-07-28',
        verifiedSession: true
      },
      {
        id: 'r-2',
        studentName: 'Kunal Sen',
        rating: 5,
        comment: 'Excellent mentor. Structured, highly responsive, and focused on core concepts rather than memorizing templates.',
        date: '2026-07-15',
        verifiedSession: true
      }
    ],
    trustComponents: {
      idVerified: true,
      certificatesUploaded: true,
      sessionsCompletedCount: 15, // Capped at 10 sessions (30 points)
      verifiedPlacementsCount: 3,  // Capped at 2 placements (20 points)
      noRefundDisputes: true       // 10 points
    },
    trustScore: 0, // calculated below
    rating: 5.0
  },
  {
    id: 'coach-2',
    name: 'Sanjay Verma',
    specialty: ['System Design', 'Backend Development', 'Database Internals'],
    bio: 'Tech Architect at Oracle, ex-PayPal. Architected databases serving 10M+ DAU. I focus on database design, caching layers, and microservices architecture.',
    pricePerSession: 1800,
    avatar: 'SV',
    certificates: ['Oracle Certified Master Java Enterprise Architect'],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    placements: [
      {
        id: 'p-4',
        studentName: 'Shreya Shah',
        companyName: 'Atlassian',
        role: 'Backend Engineer',
        proofLink: 'https://linkedin.com/in/mock-shreya-atlassian-proof'
      },
      {
        id: 'p-5',
        studentName: 'Deepak Sen',
        companyName: 'Oracle',
        role: 'Senior Member of Technical Staff',
        proofLink: 'https://linkedin.com/in/mock-deepak-oracle-proof'
      }
    ],
    reviews: [
      {
        id: 'r-3',
        studentName: 'Shreya Shah',
        rating: 5,
        comment: 'Sanjay helped me design microservices for high throughput. Super practical approach!',
        date: '2026-07-12',
        verifiedSession: true
      },
      {
        id: 'r-4',
        studentName: 'Anil Kumar',
        rating: 3,
        comment: 'Session was good, but we ran out of time on caching strategies. Requesting more details offline.',
        date: '2026-06-25',
        verifiedSession: true
      }
    ],
    trustComponents: {
      idVerified: true,
      certificatesUploaded: true,
      sessionsCompletedCount: 12, // Capped at 10 sessions (30 points)
      verifiedPlacementsCount: 2,  // 20 points
      noRefundDisputes: false      // 0 points (1 active dispute in history)
    },
    trustScore: 0,
    rating: 4.0
  },
  {
    id: 'coach-3',
    name: 'Neha Gupta',
    specialty: ['Resume Review', 'Mock Interviews', 'Behavioral Prep'],
    bio: 'Lead Technical Recruiter at Flipkart. I review 100+ resumes daily and know exactly what managers want. Let me help you rewrite your resume and structure your behavioral answers.',
    pricePerSession: 800,
    avatar: 'NG',
    certificates: [], // No certs uploaded (0 points)
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    placements: [
      {
        id: 'p-6',
        studentName: 'Vikram Singh',
        companyName: 'Flipkart',
        role: 'Associate Software Engineer',
        proofLink: 'https://linkedin.com/in/mock-vikram-flipkart'
      }
    ],
    reviews: [
      {
        id: 'r-5',
        studentName: 'Vikram Singh',
        rating: 5,
        comment: 'Neha completely restructured my resume. Highlighting impact over tasks got me 3x more interview callbacks within two weeks!',
        date: '2026-07-30',
        verifiedSession: true
      }
    ],
    trustComponents: {
      idVerified: true,              // 20 points
      certificatesUploaded: false,   // 0 points
      sessionsCompletedCount: 8,     // 8 * 3 = 24 points
      verifiedPlacementsCount: 1,    // 10 points
      noRefundDisputes: true         // 10 points
    },
    trustScore: 0,
    rating: 5.0
  },
  {
    id: 'coach-4',
    name: 'Vikram Malhotra',
    specialty: ['DSA', 'Competitive Programming'],
    bio: 'ACM-ICPC Regionalist and Codeforces Master. I help competitive programmers and graduates strengthen their logic and core computer science fundamentals in C++ and Java.',
    pricePerSession: 700,
    avatar: 'VM',
    certificates: [],
    videoUrl: '',
    placements: [
      {
        id: 'p-7',
        studentName: 'Suman Roy',
        companyName: 'TCS Digital',
        role: 'Systems Engineer',
        proofLink: 'https://linkedin.com/in/mock-suman-tcs'
      }
    ],
    reviews: [
      {
        id: 'r-6',
        studentName: 'Suman Roy',
        rating: 4,
        comment: 'Very solid teaching style. Helped me understand graph traversal algorithms deeply.',
        date: '2026-08-01',
        verifiedSession: true
      }
    ],
    trustComponents: {
      idVerified: true,              // 20 points
      certificatesUploaded: false,   // 0 points
      sessionsCompletedCount: 2,     // 2 * 3 = 6 points
      verifiedPlacementsCount: 1,    // 10 points
      noRefundDisputes: true         // 10 points
    },
    trustScore: 0,
    rating: 4.0
  },
  {
    id: 'coach-5',
    name: 'Rajesh Kumar',
    specialty: ['React', 'Frontend Development', 'Web Optimization'],
    bio: 'Frontend Architect. I teach React, CSS internals, web vitals optimization, and modern state managers. Ideal for developers trying to transition into UI roles.',
    pricePerSession: 600,
    avatar: 'RK',
    certificates: [],
    videoUrl: '',
    placements: [],
    reviews: [],
    trustComponents: {
      idVerified: true,              // 20 points
      certificatesUploaded: false,   // 0 points
      sessionsCompletedCount: 0,     // 0 points
      verifiedPlacementsCount: 0,    // 0 points
      noRefundDisputes: true         // 10 points
    },
    trustScore: 0,
    rating: 0 // No reviews yet
  }
];

// Initialize trust scores
INITIAL_COACHES.forEach(coach => {
  coach.trustScore = calculateTrustScore(coach.trustComponents);
});

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess-1',
    coachId: 'coach-1',
    coachName: 'Aravind Sharma',
    coachAvatar: 'AS',
    studentId: 'student-1',
    studentName: 'Rahul Dev',
    date: '2026-08-04',
    timeSlot: '10:00 AM - 11:00 AM',
    price: 1500,
    status: 'completed',
    escrowStatus: 'released',
    ratingLeft: true
  },
  {
    id: 'sess-2',
    coachId: 'coach-3',
    coachName: 'Neha Gupta',
    coachAvatar: 'NG',
    studentId: 'student-1',
    studentName: 'Rahul Dev',
    date: '2026-08-06',
    timeSlot: '02:00 PM - 03:00 PM',
    price: 800,
    status: 'upcoming',
    escrowStatus: 'held',
    ratingLeft: false
  },
  {
    id: 'sess-3',
    coachId: 'coach-4',
    coachName: 'Vikram Malhotra',
    coachAvatar: 'VM',
    studentId: 'student-1',
    studentName: 'Rahul Dev',
    date: '2026-08-05',
    timeSlot: '11:00 AM - 12:00 PM',
    price: 700,
    status: 'upcoming',
    escrowStatus: 'held',
    ratingLeft: false
  }
];

export const INITIAL_GOALS: StudentGoal[] = [
  {
    id: 'goal-1',
    title: 'Solve 100 DSA Problems on LeetCode',
    currentValue: 65,
    targetValue: 100,
    unit: 'Problems'
  },
  {
    id: 'goal-2',
    title: 'Complete 3 Mock Interview Sessions',
    currentValue: 1,
    targetValue: 3,
    unit: 'Sessions'
  },
  {
    id: 'goal-3',
    title: 'Polish Resume with Recruiter Review',
    currentValue: 0,
    targetValue: 1,
    unit: 'Reviews'
  }
];
