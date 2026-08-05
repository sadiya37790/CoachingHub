export interface TrustComponents {
  idVerified: boolean;             // 20 points
  certificatesUploaded: boolean;   // 20 points
  sessionsCompletedCount: number;  // Up to 30 points (e.g. 3 points per session, max 30)
  verifiedPlacementsCount: number; // 20 points (e.g. 10 points per placement proof, max 20)
  noRefundDisputes: boolean;       // 10 points (0 points if disputes are found/refunds issued)
}

export interface PlacementOutcome {
  id: string;
  studentName: string;
  companyName: string;
  role: string;
  proofLink: string;
}

export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedSession: boolean;
}

export interface Coach {
  id: string;
  name: string;
  specialty: string[];
  bio: string;
  pricePerSession: number;
  avatar: string;
  certificates: string[];
  videoUrl: string;
  placements: PlacementOutcome[];
  reviews: Review[];
  trustComponents: TrustComponents;
  trustScore: number; // dynamically calculated
  rating: number;     // average rating
}

export interface Session {
  id: string;
  coachId: string;
  coachName: string;
  coachAvatar: string;
  studentId: string;
  studentName: string;
  date: string;
  timeSlot: string;
  price: number;
  status: 'upcoming' | 'completed' | 'disputed' | 'refunded';
  escrowStatus: 'held' | 'released' | 'returned';
  ratingLeft: boolean;
}

export interface StudentGoal {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
}
