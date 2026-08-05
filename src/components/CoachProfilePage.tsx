import React, { useState } from 'react';
import { useAppState } from '../AppState';
import { getTrustLabel } from '../trustCalculator';
import { ArrowLeft, Star, ShieldCheck, CheckCircle2, XCircle, Award, Briefcase, Video, ExternalLink, Calendar, Clock } from 'lucide-react';

export const CoachProfilePage: React.FC = () => {
  const { selectedCoach, setView } = useAppState();
  
  if (!selectedCoach) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No coach selected. Please go back to discovery.</p>
        <button onClick={() => setView('discovery')} className="mt-4 px-4 py-2 bg-indigo-650 rounded-lg text-white">
          Back to Discovery
        </button>
      </div>
    );
  }

  const label = getTrustLabel(selectedCoach.trustScore);
  
  // Available Slots for mock booking
  const availableSlots = [
    { id: 'slot-1', date: '2026-08-06', time: '10:00 AM - 11:00 AM' },
    { id: 'slot-2', date: '2026-08-06', time: '02:00 PM - 03:00 PM' },
    { id: 'slot-3', date: '2026-08-07', time: '11:00 AM - 12:00 PM' },
    { id: 'slot-4', date: '2026-08-08', time: '04:00 PM - 05:00 PM' }
  ];

  const [selectedSlot, setSelectedSlot] = useState<typeof availableSlots[0] | null>(null);

  // Trust breakdown values for displaying progress bars
  const { idVerified, certificatesUploaded, sessionsCompletedCount, verifiedPlacementsCount, noRefundDisputes } = selectedCoach.trustComponents;
  
  const idScore = idVerified ? 20 : 0;
  const certScore = certificatesUploaded ? 20 : 0;
  const sessionScore = Math.min(30, sessionsCompletedCount * 3);
  const outcomeScore = Math.min(20, verifiedPlacementsCount * 10);
  const disputeScore = noRefundDisputes ? 10 : 0;

  const handleBookClick = () => {
    if (!selectedSlot) return;
    // Go to booking flow with selection
    setView('booking', selectedCoach);
    // We store the slot details globally or pass them along. We can pass selectedCoach, and the booking component will use the selected slot from a temporary or state location.
    // Let's store slot selection in localStorage for simplicity so the booking flow can fetch it!
    localStorage.setItem('trustcoach_temp_slot', JSON.stringify(selectedSlot));
  };

  const getAvatarGradient = (avatar: string) => {
    const code = avatar.charCodeAt(0) + (avatar.charCodeAt(1) || 0);
    const gradients = [
      'from-purple-600 to-indigo-600',
      'from-blue-600 to-cyan-600',
      'from-emerald-600 to-teal-600',
      'from-pink-600 to-rose-600',
      'from-amber-600 to-orange-600'
    ];
    return gradients[code % gradients.length];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => setView('discovery')}
        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Coaches</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Bio, Trust Breakdown, Outcomes, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Coach Title Block */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
            <div className={`w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br ${getAvatarGradient(selectedCoach.avatar)} flex items-center justify-center font-bold text-white shadow-lg text-2xl`}>
              {selectedCoach.avatar}
            </div>
            
            <div className="flex-grow space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">{selectedCoach.name}</h1>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedCoach.specialty.map(s => (
                      <span key={s} className="px-2.5 py-0.5 bg-slate-950 border border-slate-850 text-indigo-400 text-xs font-semibold rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score */}
                <div className={`bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center space-x-3 shrink-0`}>
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold ${label.badgeClass} border text-sm`}>
                    {selectedCoach.trustScore}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                      <span>Trust Score</span>
                    </div>
                    <span className="text-xxs text-slate-500 font-medium">{label.text}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed border-t border-slate-800/60 pt-3">
                {selectedCoach.bio}
              </p>
            </div>
          </div>

          {/* KEY TRUST MOMENT: Trust Score breakdown breakdown widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>Audited Trust Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                We independently verify every component of a coach\'s background. Hover over metrics for detail.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* ID Verification */}
              <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl flex items-start space-x-3">
                {idVerified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-200">
                    <span>Identity Verified</span>
                    <span className={idVerified ? 'text-emerald-400' : 'text-slate-500'}>{idScore}/20 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(idScore/20)*100}%` }}></div>
                  </div>
                  <span className="text-xxs text-slate-500 mt-1.5 block">Government ID matched with profile name.</span>
                </div>
              </div>

              {/* Certificate Upload */}
              <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl flex items-start space-x-3">
                {certificatesUploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-200">
                    <span>Professional Certifications</span>
                    <span className={certificatesUploaded ? 'text-emerald-400' : 'text-slate-500'}>{certScore}/20 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(certScore/20)*100}%` }}></div>
                  </div>
                  <span className="text-xxs text-slate-500 mt-1.5 block">Degrees, bootcamps or technical certifications.</span>
                </div>
              </div>

              {/* Sessions Completed */}
              <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl flex items-start space-x-3">
                {sessionsCompletedCount > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-200">
                    <span>Sessions Completed ({sessionsCompletedCount})</span>
                    <span className={sessionScore > 0 ? 'text-emerald-400' : 'text-slate-500'}>{sessionScore}/30 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(sessionScore/30)*100}%` }}></div>
                  </div>
                  <span className="text-xxs text-slate-500 mt-1.5 block">Scales +3 points per session. Capped at 10 sessions.</span>
                </div>
              </div>

              {/* Placements Outcomes */}
              <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl flex items-start space-x-3">
                {verifiedPlacementsCount > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-200">
                    <span>Verified Placements ({verifiedPlacementsCount})</span>
                    <span className={outcomeScore > 0 ? 'text-emerald-400' : 'text-slate-500'}>{outcomeScore}/20 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(outcomeScore/20)*100}%` }}></div>
                  </div>
                  <span className="text-xxs text-slate-500 mt-1.5 block">Proven student offer letters. +10 points each (max 2).</span>
                </div>
              </div>

            </div>

            {/* Refund Dispute block - Full Width */}
            <div className={`p-4 rounded-xl flex items-start space-x-3 border ${
              noRefundDisputes 
                ? 'bg-slate-955/20 border-slate-800/80' 
                : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              {noRefundDisputes ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-grow">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-200">Dispute-Free History</span>
                  <span className={noRefundDisputes ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                    {disputeScore}/10 pts
                  </span>
                </div>
                <p className="text-xxs text-slate-500 mt-1 leading-relaxed">
                  {noRefundDisputes 
                    ? '100% dispute-free record. No active student refund queries found.'
                    : 'Dispute alert: A student raised a dispute. Score penalized by 10 points.'}
                </p>
              </div>
            </div>
          </div>

          {/* Video Intro Placeholder */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-4">
              <Video className="w-5 h-5 text-indigo-400" />
              <span>Coach Introduction Video</span>
            </h2>
            {selectedCoach.videoUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-850">
                <video 
                  src={selectedCoach.videoUrl} 
                  controls 
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/60 p-6 text-center">
                <Video className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-sm font-semibold text-slate-400">No video intro uploaded yet</span>
                <span className="text-xs text-slate-500 mt-0.5">Coach has verified other core components.</span>
              </div>
            )}
          </div>

          {/* Verified Placements Outcomes list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-4">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>Verified Placement Outcomes</span>
            </h2>
            {selectedCoach.placements.length === 0 ? (
              <p className="text-slate-500 text-sm">No verified placement outcomes uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {selectedCoach.placements.map(p => (
                  <div key={p.id} className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-200">
                        {p.studentName} placed at <span className="text-white font-bold">{p.companyName}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.role}</div>
                    </div>
                    <a 
                      href={p.proofLink}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center space-x-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shrink-0"
                    >
                      <span>Verify Placement Proof</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-5">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Student Reviews ({selectedCoach.reviews.length})</span>
            </h2>
            {selectedCoach.reviews.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No reviews available yet. Completed sessions will show here.</p>
            ) : (
              <div className="space-y-4">
                {selectedCoach.reviews.map(r => (
                  <div key={r.id} className="border-b border-slate-800/80 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-bold text-slate-200">{r.studentName}</span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${
                                  i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-xxs text-slate-500">{r.date}</span>
                        </div>
                      </div>
                      
                      {r.verifiedSession && (
                        <div className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-xxs font-bold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified session</span>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-2.5 leading-relaxed bg-slate-950/20 p-2.5 rounded-lg">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Booking Card Widget */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit sticky top-24 space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Booking Cost</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-3xl font-extrabold text-white">₹{selectedCoach.pricePerSession}</span>
                <span className="text-slate-400 text-sm">/ hr</span>
              </div>
            </div>

            {/* Escrow Banner on sidebar */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
              selectedCoach.trustScore >= 70 
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center space-x-2 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{selectedCoach.trustScore >= 70 ? 'Fast Release' : 'High Escrow Held'}</span>
              </div>
              <p className="text-xxs text-slate-400">
                {selectedCoach.trustScore >= 70 
                  ? 'Highly Trusted Coach. Escrow releases quickly post-session.' 
                  : 'Coach has low Trust. Funds remain locked until you explicitly confirm completion.'}
              </p>
            </div>

            {/* Certificate count display */}
            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Qualifications</h3>
              <div className="space-y-2">
                {selectedCoach.certificates.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-slate-300">
                    <Award className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="line-clamp-1">{cert}</span>
                  </div>
                ))}
                {selectedCoach.certificates.length === 0 && (
                  <span className="text-xs text-slate-500 italic">No verification certificates uploaded yet.</span>
                )}
              </div>
            </div>

            {/* Date / Time Slot Picker */}
            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-sm font-semibold text-white mb-3">Select Date & Time</h3>
              <div className="space-y-2.5">
                {availableSlots.map(slot => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition-all-300 ${
                        isSelected 
                          ? 'bg-indigo-600/10 border-indigo-500 text-white font-medium' 
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span>{slot.date}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span>{slot.time}</span>
                        </div>
                      </div>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleBookClick}
              disabled={!selectedSlot}
              className={`w-full py-3 rounded-xl text-xs font-bold text-center transition-all-300 shadow-md ${
                selectedSlot 
                  ? 'bg-indigo-650 hover:bg-indigo-600 text-white cursor-pointer hover:shadow-indigo-500/20' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Confirm and Proceed to Booking
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
