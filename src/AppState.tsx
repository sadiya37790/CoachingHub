import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Coach, Session, StudentGoal, Review } from './types';
import { INITIAL_COACHES, INITIAL_SESSIONS, INITIAL_GOALS } from './mockData';
import { calculateTrustScore } from './trustCalculator';

interface AppContextType {
  coaches: Coach[];
  sessions: Session[];
  goals: StudentGoal[];
  currentUserRole: 'student' | 'coach';
  currentView: 'discovery' | 'profile' | 'booking' | 'student-dashboard' | 'coach-dashboard';
  selectedCoach: Coach | null;
  activeCoachId: string;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or use initial mock data
  const [coaches, setCoaches] = useState<Coach[]>(() => {
    const saved = localStorage.getItem('trustcoach_coaches');
    return saved ? JSON.parse(saved) : INITIAL_COACHES;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('trustcoach_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [goals, setGoals] = useState<StudentGoal[]>(() => {
    const saved = localStorage.getItem('trustcoach_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [currentUserRole, setCurrentUserRole] = useState<'student' | 'coach'>('student');
  const [currentView, setCurrentView] = useState<'discovery' | 'profile' | 'booking' | 'student-dashboard' | 'coach-dashboard'>('discovery');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [activeCoachId, setActiveCoachId] = useState<string>('coach-5'); // Default to Rajesh (new coach) for coach view demo

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('trustcoach_coaches', JSON.stringify(coaches));
  }, [coaches]);

  useEffect(() => {
    localStorage.setItem('trustcoach_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('trustcoach_goals', JSON.stringify(goals));
  }, [goals]);

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

  const bookSession = (coachId: string, date: string, timeSlot: string) => {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach) return;

    const newSession: Session = {
      id: `sess-${Date.now()}`,
      coachId: coach.id,
      coachName: coach.name,
      coachAvatar: coach.avatar,
      studentId: 'student-1',
      studentName: 'Rahul Dev',
      date,
      timeSlot,
      price: coach.pricePerSession,
      status: 'upcoming',
      escrowStatus: 'held',
      ratingLeft: false
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentView('student-dashboard');
  };

  const confirmSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        // Mark as completed, release escrow
        const updatedSession = { ...s, status: 'completed' as const, escrowStatus: 'released' as const };
        
        // Update the coach's session completed count
        setCoaches(prevCoaches => prevCoaches.map(c => {
          if (c.id === s.coachId) {
            const updatedComponents = {
              ...c.trustComponents,
              sessionsCompletedCount: c.trustComponents.sessionsCompletedCount + 1
            };
            const updatedScore = calculateTrustScore(updatedComponents);
            return {
              ...c,
              trustComponents: updatedComponents,
              trustScore: updatedScore
            };
          }
          return c;
        }));

        return updatedSession;
      }
      return s;
    }));
  };

  const disputeSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        // Mark as disputed
        const updatedSession = { ...s, status: 'disputed' as const };
        
        // Penalize the coach by marking noRefundDisputes to false (instantly penalty)
        setCoaches(prevCoaches => prevCoaches.map(c => {
          if (c.id === s.coachId) {
            const updatedComponents = {
              ...c.trustComponents,
              noRefundDisputes: false
            };
            const updatedScore = calculateTrustScore(updatedComponents);
            return {
              ...c,
              trustComponents: updatedComponents,
              trustScore: updatedScore
            };
          }
          return c;
        }));

        return updatedSession;
      }
      return s;
    }));
  };

  const submitReview = (sessionId: string, rating: number, comment: string) => {
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

    setCoaches(prevCoaches => prevCoaches.map(c => {
      if (c.id === session.coachId) {
        const updatedReviews = [newReview, ...c.reviews];
        // Calculate new rating average
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));

        return {
          ...c,
          reviews: updatedReviews,
          rating: avgRating
        };
      }
      return c;
    }));

    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ratingLeft: true } : s));
  };

  const uploadCertificate = (coachId: string, certName: string) => {
    setCoaches(prevCoaches => prevCoaches.map(c => {
      if (c.id === coachId) {
        const updatedCerts = [...c.certificates, certName];
        const updatedComponents = {
          ...c.trustComponents,
          certificatesUploaded: true
        };
        const updatedScore = calculateTrustScore(updatedComponents);
        return {
          ...c,
          certificates: updatedCerts,
          trustComponents: updatedComponents,
          trustScore: updatedScore
        };
      }
      return c;
    }));
  };

  const addGoal = (title: string, targetValue: number, unit: string) => {
    const newGoal: StudentGoal = {
      id: `goal-${Date.now()}`,
      title,
      currentValue: 0,
      targetValue,
      unit
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoalProgress = (goalId: string, value: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const nextVal = Math.min(g.targetValue, Math.max(0, value));
        return { ...g, currentValue: nextVal };
      }
      return g;
    }));
  };

  return (
    <AppContext.Provider value={{
      coaches,
      sessions,
      goals,
      currentUserRole,
      currentView,
      selectedCoach,
      activeCoachId,
      setRole,
      setView,
      bookSession,
      confirmSession,
      disputeSession,
      submitReview,
      uploadCertificate,
      addGoal,
      updateGoalProgress,
      setActiveCoachId
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
