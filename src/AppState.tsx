import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Coach, Session, StudentGoal, Review } from './types';
import { INITIAL_COACHES, INITIAL_SESSIONS, INITIAL_GOALS } from './mockData';
import { calculateTrustScore } from './trustCalculator';
import { isFirebaseConfigured, auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';

interface AppContextType {
  coaches: Coach[];
  sessions: Session[];
  goals: StudentGoal[];
  currentUserRole: 'student' | 'coach';
  currentView: 'discovery' | 'profile' | 'booking' | 'student-dashboard' | 'coach-dashboard';
  selectedCoach: Coach | null;
  activeCoachId: string;
  user: { uid: string; email: string; name: string; role: 'student' | 'coach' } | null;
  setRole: (role: 'student' | 'coach') => void;
  setView: (view: 'discovery' | 'profile' | 'booking' | 'student-dashboard' | 'coach-dashboard', coach?: Coach | null) => void;
  bookSession: (coachId: string, date: string, timeSlot: string) => void;
  confirmSession: (sessionId: string) => void;
  disputeSession: (sessionId: string) => void;
  submitReview: (sessionId: string, rating: number, comment: string) => void;
  uploadCertificate: (coachId: string, certName: string) => void;
  addGoal: (title: string, targetValue: number, unit: string) => void;
  updateGoalProgress: (goalId: string, value: number) => void;
  setActiveCoachId: (id: string) => void;
  logInMockUser: (mockUser: any) => void;
  logOut: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState<{ uid: string; email: string; name: string; role: 'student' | 'coach' } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Database lists
  const [coaches, setCoaches] = useState<Coach[]>(INITIAL_COACHES);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [goals, setGoals] = useState<StudentGoal[]>([]);

  const [currentUserRole, setCurrentUserRole] = useState<'student' | 'coach'>('student');
  const [currentView, setCurrentView] = useState<'discovery' | 'profile' | 'booking' | 'student-dashboard' | 'coach-dashboard'>('discovery');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [activeCoachId, setActiveCoachId] = useState<string>('coach-5'); // Rajesh

  // 1. Listen to Auth State
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Offline fallback: check sessionStorage
      const savedUser = sessionStorage.getItem('trustcoach_mock_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        setCurrentUserRole(u.role);
      }
      setAuthLoading(false);
      return;
    }

    // Real Firebase listener
    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch custom role details from Firestore public.profiles
        const userDocRef = doc(db!, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        let role: 'student' | 'coach' = 'student';
        let name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';

        if (userDoc.exists()) {
          const data = userDoc.data();
          role = data.role || 'student';
          name = data.name || name;
        }

        const authenticatedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name,
          role
        };

        setUser(authenticatedUser);
        setCurrentUserRole(role);
        if (role === 'coach') {
          setCurrentView('coach-dashboard');
        } else {
          setCurrentView('discovery');
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch/Sync Databases based on User and Offline Mode
  useEffect(() => {
    // If not logged in, we only show local coaches
    if (!user) {
      setSessions([]);
      setGoals([]);
      return;
    }

    if (!isFirebaseConfigured) {
      // LocalStorage Mode database sync
      const savedCoaches = sessionStorage.getItem('trustcoach_coaches');
      const savedSessions = sessionStorage.getItem('trustcoach_sessions');
      const savedGoals = sessionStorage.getItem('trustcoach_goals');

      setCoaches(savedCoaches ? JSON.parse(savedCoaches) : INITIAL_COACHES);
      setSessions(savedSessions ? JSON.parse(savedSessions) : INITIAL_SESSIONS);
      setGoals(savedGoals ? JSON.parse(savedGoals) : INITIAL_GOALS);
      return;
    }

    // Firebase Firestore Realtime Sync
    // A. Sync Coaches and auto-seed if empty
    const unsubscribeCoaches = onSnapshot(collection(db!, 'coaches'), async (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed database with initial coaches
        for (const coach of INITIAL_COACHES) {
          await setDoc(doc(db!, 'coaches', coach.id), coach);
        }
      } else {
        const coachesList = snapshot.docs.map(d => d.data() as Coach);
        // Ensure trust score is calculated based on current state
        coachesList.forEach(c => {
          c.trustScore = calculateTrustScore(c.trustComponents);
        });
        setCoaches(coachesList);
      }
    });

    // B. Sync Sessions (Filtered by student or coach ID)
    const sessionsQuery = user.role === 'student'
      ? query(collection(db!, 'sessions'), where('studentId', '==', user.uid))
      : query(collection(db!, 'sessions'), where('coachId', '==', user.uid));

    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Session);
      setSessions(sessionsList);
    });

    // C. Sync Goals (For Student)
    const goalsQuery = query(collection(db!, 'goals'), where('studentId', '==', user.uid));
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      const goalsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as StudentGoal);
      setGoals(goalsList);
    });

    return () => {
      unsubscribeCoaches();
      unsubscribeSessions();
      unsubscribeGoals();
    };
  }, [user]);

  // Local storage sync for offline mode
  useEffect(() => {
    if (!isFirebaseConfigured && user) {
      sessionStorage.setItem('trustcoach_coaches', JSON.stringify(coaches));
    }
  }, [coaches, user]);

  useEffect(() => {
    if (!isFirebaseConfigured && user) {
      sessionStorage.setItem('trustcoach_sessions', JSON.stringify(sessions));
    }
  }, [sessions, user]);

  useEffect(() => {
    if (!isFirebaseConfigured && user) {
      sessionStorage.setItem('trustcoach_goals', JSON.stringify(goals));
    }
  }, [goals, user]);

  const logInMockUser = (mockUser: any) => {
    setUser(mockUser);
    setCurrentUserRole(mockUser.role);
    if (mockUser.role === 'coach') {
      setCurrentView('coach-dashboard');
    } else {
      setCurrentView('discovery');
    }
  };

  const logOut = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth!);
    } else {
      sessionStorage.removeItem('trustcoach_mock_user');
      sessionStorage.removeItem('trustcoach_coaches');
      sessionStorage.removeItem('trustcoach_sessions');
      sessionStorage.removeItem('trustcoach_goals');
      setUser(null);
    }
    // Hard refresh window to restore clean initial mock state
    window.location.reload();
  };

  const setRole = (role: 'student' | 'coach') => {
    setCurrentUserRole(role);
    if (role === 'coach') {
      setCurrentView('coach-dashboard');
    } else {
      setCurrentView('discovery');
    }
  };

  const setView = (view: 'discovery' | 'profile' | 'booking' | 'student-dashboard' | 'coach-dashboard', coach: Coach | null = null) => {
    setCurrentView(view);
    if (coach) {
      setSelectedCoach(coach);
    }
  };

  const bookSession = async (coachId: string, date: string, timeSlot: string) => {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach || !user) return;

    const newSession: Omit<Session, 'id'> = {
      coachId: coach.id,
      coachName: coach.name,
      coachAvatar: coach.avatar,
      studentId: user.uid,
      studentName: user.name,
      date,
      timeSlot,
      price: coach.pricePerSession,
      status: 'upcoming',
      escrowStatus: 'held',
      ratingLeft: false
    };

    if (isFirebaseConfigured) {
      await addDoc(collection(db!, 'sessions'), newSession);
    } else {
      const localSession: Session = { id: `sess-${Date.now()}`, ...newSession };
      setSessions(prev => [localSession, ...prev]);
    }
    setCurrentView('student-dashboard');
  };

  const confirmSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Update session status in DB
    if (isFirebaseConfigured) {
      await updateDoc(doc(db!, 'sessions', sessionId), {
        status: 'completed',
        escrowStatus: 'released'
      });
      // Increment coach session completed count in Firestore
      const coachRef = doc(db!, 'coaches', session.coachId);
      const coachDoc = await getDoc(coachRef);
      if (coachDoc.exists()) {
        const c = coachDoc.data() as Coach;
        const updatedComponents = {
          ...c.trustComponents,
          sessionsCompletedCount: c.trustComponents.sessionsCompletedCount + 1
        };
        await updateDoc(coachRef, {
          trustComponents: updatedComponents
        });
      }
    } else {
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return { ...s, status: 'completed' as const, escrowStatus: 'released' as const };
        }
        return s;
      }));
      setCoaches(prevCoaches => prevCoaches.map(c => {
        if (c.id === session.coachId) {
          const updatedComponents = {
            ...c.trustComponents,
            sessionsCompletedCount: c.trustComponents.sessionsCompletedCount + 1
          };
          return { ...c, trustComponents: updatedComponents, trustScore: calculateTrustScore(updatedComponents) };
        }
        return c;
      }));
    }
  };

  const disputeSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    if (isFirebaseConfigured) {
      await updateDoc(doc(db!, 'sessions', sessionId), {
        status: 'disputed'
      });
      // Flag coach disputes
      const coachRef = doc(db!, 'coaches', session.coachId);
      const coachDoc = await getDoc(coachRef);
      if (coachDoc.exists()) {
        const c = coachDoc.data() as Coach;
        const updatedComponents = {
          ...c.trustComponents,
          noRefundDisputes: false
        };
        await updateDoc(coachRef, {
          trustComponents: updatedComponents
        });
      }
    } else {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'disputed' as const } : s));
      setCoaches(prevCoaches => prevCoaches.map(c => {
        if (c.id === session.coachId) {
          const updatedComponents = {
            ...c.trustComponents,
            noRefundDisputes: false
          };
          return { ...c, trustComponents: updatedComponents, trustScore: calculateTrustScore(updatedComponents) };
        }
        return c;
      }));
    }
  };

  const submitReview = async (sessionId: string, rating: number, comment: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      studentName: session.studentName,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      verifiedSession: true
    };

    if (isFirebaseConfigured) {
      await updateDoc(doc(db!, 'sessions', sessionId), {
        ratingLeft: true
      });
      const coachRef = doc(db!, 'coaches', session.coachId);
      const coachDoc = await getDoc(coachRef);
      if (coachDoc.exists()) {
        const c = coachDoc.data() as Coach;
        const updatedReviews = [newReview, ...c.reviews];
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));
        await updateDoc(coachRef, {
          reviews: updatedReviews,
          rating: avgRating
        });
      }
    } else {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ratingLeft: true } : s));
      setCoaches(prevCoaches => prevCoaches.map(c => {
        if (c.id === session.coachId) {
          const updatedReviews = [newReview, ...c.reviews];
          const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));
          return { ...c, reviews: updatedReviews, rating: avgRating };
        }
        return c;
      }));
    }
  };

  const uploadCertificate = async (coachId: string, certName: string) => {
    if (isFirebaseConfigured) {
      const coachRef = doc(db!, 'coaches', coachId);
      const coachDoc = await getDoc(coachRef);
      if (coachDoc.exists()) {
        const c = coachDoc.data() as Coach;
        const updatedCerts = [...c.certificates, certName];
        const updatedComponents = {
          ...c.trustComponents,
          certificatesUploaded: true
        };
        await updateDoc(coachRef, {
          certificates: updatedCerts,
          trustComponents: updatedComponents
        });
      }
    } else {
      setCoaches(prevCoaches => prevCoaches.map(c => {
        if (c.id === coachId) {
          const updatedCerts = [...c.certificates, certName];
          const updatedComponents = {
            ...c.trustComponents,
            certificatesUploaded: true
          };
          return {
            ...c,
            certificates: updatedCerts,
            trustComponents: updatedComponents,
            trustScore: calculateTrustScore(updatedComponents)
          };
        }
        return c;
      }));
    }
  };

  const addGoal = async (title: string, targetValue: number, unit: string) => {
    if (!user) return;

    const newGoal: Omit<StudentGoal, 'id'> = {
      studentId: user.uid,
      title,
      currentValue: 0,
      targetValue,
      unit
    } as any;

    if (isFirebaseConfigured) {
      await addDoc(collection(db!, 'goals'), newGoal);
    } else {
      const localGoal: StudentGoal = { id: `goal-${Date.now()}`, ...newGoal } as any;
      setGoals(prev => [...prev, localGoal]);
    }
  };

  const updateGoalProgress = async (goalId: string, value: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const nextVal = Math.min(goal.targetValue, Math.max(0, value));

    if (isFirebaseConfigured) {
      await updateDoc(doc(db!, 'goals', goalId), {
        currentValue: nextVal
      });
    } else {
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentValue: nextVal } : g));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-semibold">Initializing TrustCoach secure gateway...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      coaches,
      sessions,
      goals,
      currentUserRole,
      currentView,
      selectedCoach,
      activeCoachId,
      user,
      setRole,
      setView,
      bookSession,
      confirmSession,
      disputeSession,
      submitReview,
      uploadCertificate,
      addGoal,
      updateGoalProgress,
      setActiveCoachId,
      logInMockUser,
      logOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
