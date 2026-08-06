import React, { useState } from 'react';
import { useAppState } from '../AppState';
import { isFirebaseConfigured, auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Shield, Lock, Mail, User as UserIcon, ShieldCheck, GraduationCap, Briefcase, Zap } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'coach'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Read auth methods from context to set user state in mock fallback
  const appState = useAppState();

  const handleGuestLogin = () => {
    setLoading(true);
    setError('');
    
    // Simulate slight loading for premium UX feedback
    setTimeout(() => {
      setLoading(false);
      const mockUser = {
        uid: `guest-${Date.now()}`,
        email: 'guest@demo.com',
        name: 'Guest',
        role: 'student' as const
      };
      
      // Save mock session
      localStorage.setItem('trustcoach_mock_user', JSON.stringify(mockUser));
      
      // Trigger AppState login update
      if ((appState as any).logInMockUser) {
        (appState as any).logInMockUser(mockUser);
      }
    }, 500);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isFirebaseConfigured) {
      // Mock auth flow for testing
      setTimeout(() => {
        setLoading(false);
        const mockUser = {
          uid: `mock-uid-${Date.now()}`,
          email,
          displayName: name || email.split('@')[0],
          role: selectedRole
        };
        // Save mock session
        localStorage.setItem('trustcoach_mock_user', JSON.stringify(mockUser));
        
        // Trigger AppState login update
        // We'll expose logInMockUser in AppState context
        if ((appState as any).logInMockUser) {
          (appState as any).logInMockUser(mockUser);
        }
      }, 1000);
      return;
    }

    // Real Firebase auth flow
    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth!, email, password);
        // AppState onAuthStateChange listener will handle fetching profile and updates automatically!
      } else {
        // Sign Up
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
        const user = userCredential.user;

        // Save profile role and details in Firestore
        await setDoc(doc(db!, 'users', user.uid), {
          uid: user.uid,
          name,
          email,
          role: selectedRole,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-16 px-4">
      
      {/* Auth Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative blur backdrop */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-550/15 mb-3.5">
            <Shield className="w-6 h-6 fill-indigo-200/10" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {isLogin ? 'Sign in to TrustCoach' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin ? 'Enter details to access your dashboard' : 'Verify profile and start prepping'}
          </p>
        </div>

        {/* Fallback warning banner if Firebase is offline */}
        {!isFirebaseConfigured && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start space-x-2 text-amber-400 text-[10px] leading-normal">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Offline Demo Mode Active</span>
              <p className="text-slate-400 mt-0.5">Firebase keys not configured. Enter any email and password to log in instantly.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        {/* Continue as Guest Button (Primary) */}
        <button
          onClick={handleGuestLogin}
          type="button"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-indigo-500/20 cursor-pointer mb-2"
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Sign in as Guest</span>
        </button>

        {/* Separator Divider */}
        <div className="flex items-center my-5">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="mx-4 text-[9px] text-slate-500 font-bold uppercase tracking-wider">or sign in with credentials</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {/* Role selector on registration */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Register As</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all-300 ${
                    selectedRole === 'student'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-450 hover:border-slate-800'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('coach')}
                  className={`py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all-300 ${
                    selectedRole === 'coach'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-450 hover:border-slate-800'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Coach</span>
                </button>
              </div>
            </div>
          )}

          {/* Name Field (Signup only) */}
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Rahul Dev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 transition-all-300 ${
              loading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-600 hover:shadow-indigo-550/15 cursor-pointer'
            }`}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{isLogin ? 'Access Dashboard' : 'Register Profile'}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle link */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-400 font-semibold hover:text-indigo-350 transition-colors focus:outline-none"
          >
            {isLogin ? 'Create one now' : 'Sign in here'}
          </button>
        </div>

      </div>
    </div>
  );
};
