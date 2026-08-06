import React, { useState } from 'react';
import { useAppState } from '../AppState';
import { getTrustLabel } from '../trustCalculator';
import { Award, TrendingUp, Users, Upload, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const CoachDashboard: React.FC = () => {
  const { 
    coaches, 
    sessions, 
    activeCoachId, 
    setActiveCoachId, 
    uploadCertificate 
  } = useAppState();

  const [certNameInput, setCertNameInput] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Get active coach details
  const currentCoach = coaches.find(c => c.id === activeCoachId) || coaches[0];
  const label = getTrustLabel(currentCoach.trustScore);

  // Extract active coach components
  const { idVerified, certificatesUploaded, sessionsCompletedCount, verifiedPlacementsCount, noRefundDisputes } = currentCoach.trustComponents;

  // Calculate tips
  const tips = [];
  if (!idVerified) {
    tips.push({
      text: 'Verify your Government ID to protect your account and gain +20 trust points.',
      action: 'Verify ID',
      points: 20
    });
  }
  if (!certificatesUploaded) {
    tips.push({
      text: 'Upload university degrees or professional certificates (AWS, GCP, etc.) to gain +20 trust points.',
      action: 'upload',
      points: 20
    });
  }
  if (sessionsCompletedCount < 10) {
    const nextMilestone = 10 - sessionsCompletedCount;
    tips.push({
      text: `Complete ${nextMilestone} more session${nextMilestone > 1 ? 's' : ''} with students to maximize your completion points. (+3 pts each)`,
      points: nextMilestone * 3
    });
  }
  if (verifiedPlacementsCount < 2) {
    const needed = 2 - verifiedPlacementsCount;
    tips.push({
      text: `Submit ${needed} more student offer letter proof${needed > 1 ? 's' : ''} to verify placement track record. (+10 pts each)`,
      points: needed * 10
    });
  }
  if (!noRefundDisputes) {
    tips.push({
      text: 'Warning: Resolving disputes quickly without refund failures helps restore trust score metrics over time.',
      points: 10,
      warning: true
    });
  }

  const handleCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNameInput.trim()) return;
    
    uploadCertificate(currentCoach.id, certNameInput);
    setCertNameInput('');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  // Find students who booked sessions with this coach
  const coachStudents = sessions
    .filter(s => s.coachId === currentCoach.id)
    .map(s => ({
      name: s.studentName,
      date: s.date,
      time: s.timeSlot,
      status: s.status,
      escrow: s.escrowStatus,
      price: s.price
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Switch Coach Bar - Testing Feature */}
      <div className="bg-slate-900 border border-indigo-500/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-xs font-bold text-slate-350 uppercase tracking-wide">Prototype Testing Suite</span>
          </div>
          <p className="text-slate-400 text-[10px] mt-0.5">Switch coach profiles to inspect how different trust scores adjust dashboard alerts and payment releases.</p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <label className="text-xs text-slate-400 font-medium">Select Coach Profile:</label>
          <select 
            value={activeCoachId} 
            onChange={(e) => setActiveCoachId(e.target.value)}
            className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
          >
            {coaches.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} (Score: {c.trustScore})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Trust Metrics & Tips */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Trust Breakdown Score Ring */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Trust score</h2>
            
            <div className="relative inline-flex items-center justify-center p-6">
              {/* Outer Score Circle */}
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center relative">
                <span className="text-4xl font-extrabold text-white">{currentCoach.trustScore}</span>
                <span className="text-slate-500 text-[10px] mt-0.5">/ 100 max</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className={`text-xs font-bold ${label.textClass}`}>{label.text}</span>
              <p className="text-[10px] text-slate-500 leading-normal">
                {currentCoach.trustScore >= 80 ? 'Excellent! Standard fast-release enabled for bookings.' :
                 currentCoach.trustScore >= 50 ? 'Good standing. Complete certificates or sessions to hit 80+.' :
                 'Warning: Restricted escrow. Payments held until students confirm attendance.'}
              </p>
            </div>
          </div>

          {/* Actionable Tips Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Improve Your Score</span>
            </h2>

            {tips.length === 0 ? (
              <p className="text-emerald-400 text-xs font-medium flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>You have maximized your Trust Score!</span>
              </p>
            ) : (
              <div className="space-y-3.5">
                {tips.map((tip, index) => (
                  <div key={index} className={`p-3 rounded-xl border text-[10px] leading-normal ${
                    tip.warning ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex justify-between items-start font-bold mb-1">
                      <span className={tip.warning ? 'text-rose-400' : 'text-slate-350'}>
                        {tip.warning ? 'Dispute Penalty Alert' : 'Recommendation'}
                      </span>
                      <span className={tip.warning ? 'text-rose-400' : 'text-indigo-400'}>
                        {tip.warning ? '-10 pts' : `+${tip.points} pts potential`}
                      </span>
                    </div>
                    <p>{tip.text}</p>
                    
                    {tip.action === 'upload' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800">
                        <form onSubmit={handleCertSubmit} className="flex gap-2">
                          <input 
                            type="text"
                            required
                            placeholder="Cert Name (e.g. AWS Certified)"
                            value={certNameInput}
                            onChange={(e) => setCertNameInput(e.target.value)}
                            className="flex-grow p-1.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button 
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-600 px-3 py-1.5 text-white font-bold rounded text-[10px] transition-colors shrink-0 flex items-center space-x-1"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                          </button>
                        </form>
                        {uploadSuccess && (
                          <span className="text-[10px] text-emerald-400 mt-1 block">Certificate uploaded! Trust Score updated (+20)</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 2 Columns: Students & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Students List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Enrolled Students & Earnings</span>
            </h2>

            {coachStudents.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/45 border border-dashed border-slate-800 rounded-xl">
                <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-xs">No bookings found for your profile yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-2">Student Name</th>
                      <th className="pb-3 pr-2">Date & Time</th>
                      <th className="pb-3 pr-2">Booking Payment</th>
                      <th className="pb-3">Escrow Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coachStudents.map((stud, i) => (
                      <tr key={i} className="border-b border-slate-800/60 last:border-b-0">
                        <td className="py-3.5 pr-2 font-bold text-white">{stud.name}</td>
                        <td className="py-3.5 pr-2 text-slate-400">
                          <div>{stud.date}</div>
                          <div className="text-slate-500 text-[10px]">{stud.time}</div>
                        </td>
                        <td className="py-3.5 pr-2 text-slate-300 font-semibold">₹{stud.price}</td>
                        <td className="py-3.5">
                          {stud.escrow === 'held' ? (
                            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-semibold text-amber-400">
                              Locked in Escrow
                            </span>
                          ) : stud.escrow === 'released' ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-semibold text-emerald-400">
                              Released to Bank
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] font-semibold text-rose-450">
                              Returned/Disputed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Current Qualifications & Placements Verification */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span>Verified Qualifications</span>
            </h2>

            <div className="space-y-3">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs font-semibold text-slate-350 uppercase mb-2">Uploaded Certificates</div>
                {currentCoach.certificates.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No certificates verified yet. Use improve tips panel to upload.</span>
                ) : (
                  <ul className="space-y-2">
                    {currentCoach.certificates.map((cert, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs font-semibold text-slate-350 uppercase mb-2">Audited Placements outcomes ({currentCoach.placements.length})</div>
                {currentCoach.placements.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No offer verification proof links uploaded yet.</span>
                ) : (
                  <ul className="space-y-2">
                    {currentCoach.placements.map(pl => (
                      <li key={pl.id} className="flex items-center justify-between text-xs text-slate-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{pl.studentName} placed at {pl.companyName}</span>
                        </div>
                        <a href={pl.proofLink} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-0.5">
                          <span>Proof Link</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
