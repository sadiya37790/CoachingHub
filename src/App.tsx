import { useAppState } from './AppState';
import { DiscoveryPage } from './components/DiscoveryPage';
import { CoachProfilePage } from './components/CoachProfilePage';
import { BookingFlow } from './components/BookingFlow';
import { StudentDashboard } from './components/StudentDashboard';
import { CoachDashboard } from './components/CoachDashboard';
import { AuthScreen } from './components/AuthScreen';
import { Shield, Briefcase, GraduationCap, LogOut } from 'lucide-react';

function App() {
  const { currentView, currentUserRole, setRole, setView, user, logOut } = useAppState();

  const renderView = () => {
    switch (currentView) {
      case 'discovery':
        return <DiscoveryPage />;
      case 'profile':
        return <CoachProfilePage />;
      case 'booking':
        return <BookingFlow />;
      case 'student-dashboard':
        return <StudentDashboard />;
      case 'coach-dashboard':
        return <CoachDashboard />;
      default:
        return <DiscoveryPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => user && setView('discovery')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-550/10 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 fill-indigo-200/10" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight">TrustCoach</span>
              <span className="text-[10px] text-indigo-400 font-semibold block -mt-0.5">Verified Preparation</span>
            </div>
          </div>

          {user && (
            <>
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-1">
                <button 
                  onClick={() => setView('discovery')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentView === 'discovery' || currentView === 'profile' || currentView === 'booking'
                      ? 'bg-slate-900 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Find Coaches
                </button>
                <button 
                  onClick={() => setView('student-dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentView === 'student-dashboard'
                      ? 'bg-slate-900 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student Dashboard
                </button>
                <button 
                  onClick={() => setView('coach-dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentView === 'coach-dashboard'
                      ? 'bg-slate-900 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Coach Workspace
                </button>
              </nav>

              {/* User Role Switcher & Auth status */}
              <div className="flex items-center space-x-4">
                
                {/* Mode Switcher pill */}
                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
                  <button
                    onClick={() => setRole('student')}
                    className={`px-2.5 py-1 rounded-md transition-all-300 flex items-center space-x-1 ${
                      currentUserRole === 'student'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Student View</span>
                  </button>
                  <button
                    onClick={() => setRole('coach')}
                    className={`px-2.5 py-1 rounded-md transition-all-300 flex items-center space-x-1 ${
                      currentUserRole === 'coach'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Coach View</span>
                  </button>
                </div>

                {/* Profile Badge & Sign out */}
                <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-xs font-bold text-white leading-none">{user.name}</span>
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{user.role} mode</span>
                  </div>
                  
                  <button 
                    onClick={logOut}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all-300"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </>
          )}

        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-grow">
        {user ? renderView() : <AuthScreen />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-slate-500 text-xs">
          <div>
            <div className="font-semibold text-slate-400 flex items-center justify-center md:justify-start space-x-1.5 mb-1">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>TrustCoach Protocol</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed max-w-md">
              A decentralized escrow and audit mechanism. TrustScores are audited on-chain (mocked) to secure high-stakes technical mentorship contracts.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-500 hover:text-slate-350 transition-colors flex items-center space-x-1"
            >
              <span>GitHub Repository</span>
            </a>
            <span>•</span>
            <span>Escrow Sandbox v1.0.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
