import React, { useState } from 'react';
import { useAppState } from '../AppState';
import { CheckCircle2, ShieldAlert, Star, ShieldCheck, Clock, Plus, Award, MessageSquare } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { 
    sessions, 
    goals, 
    confirmSession, 
    disputeSession, 
    submitReview, 
    addGoal, 
    updateGoalProgress 
  } = useAppState();

  // Review states
  const [activeReviewSessionId, setActiveReviewSessionId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // New Goal states
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState<number>(10);
  const [newGoalUnit, setNewGoalUnit] = useState('Problems');
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent, sessionId: string) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    submitReview(sessionId, reviewRating, reviewComment);
    setActiveReviewSessionId(null);
    setReviewComment('');
    setReviewRating(5);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || newGoalTarget <= 0) return;
    addGoal(newGoalTitle, newGoalTarget, newGoalUnit);
    setNewGoalTitle('');
    setShowAddGoalModal(false);
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Student Workspace</h1>
          <p className="text-slate-400 text-xs mt-1">Track your placement prep targets, manage session completion, and trigger secure escrow releases.</p>
        </div>
        <div className="flex items-center space-x-2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>Active Escrow Shield</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Booked Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Coaching Sessions</span>
            </h2>
            <span className="text-xxs text-slate-500">Escrow funds lock upon booking.</span>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 border border-slate-850 rounded-2xl">
              <Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-xs">No bookings found. Head to discovery to hire a coach.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map(session => {
                const isUpcoming = session.status === 'upcoming';
                const isCompleted = session.status === 'completed';
                const isDisputed = session.status === 'disputed';
                
                return (
                  <div 
                    key={session.id} 
                    className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-all-300 ${
                      isDisputed ? 'border-rose-500/30' :
                      isCompleted ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-800'
                    }`}
                  >
                    {/* Top row: Coach & Status */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAvatarGradient(session.coachAvatar)} flex items-center justify-center font-bold text-white text-sm`}>
                          {session.coachAvatar}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{session.coachName}</h3>
                          <span className="text-xxs text-slate-500">{session.date} • {session.timeSlot}</span>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-xs font-bold text-white">₹{session.price}</span>
                        {isUpcoming && (
                          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-550/20 text-xxxxs font-bold uppercase px-2 py-0.5 rounded">
                            Upcoming (Held in Escrow)
                          </span>
                        )}
                        {isCompleted && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-550/20 text-xxxxs font-bold uppercase px-2 py-0.5 rounded">
                            Completed & Released
                          </span>
                        )}
                        {isDisputed && (
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-550/20 text-xxxxs font-bold uppercase px-2 py-0.5 rounded">
                            Disputed (Funds Locked)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Escrow Status Banner on Card */}
                    <div className={`p-3 rounded-xl border text-xxs flex justify-between items-center ${
                      session.escrowStatus === 'held'
                        ? 'bg-slate-950/80 border-slate-850 text-slate-400'
                        : session.escrowStatus === 'released'
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-950/20 border-rose-550/20 text-rose-450'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className={`w-4 h-4 ${session.escrowStatus === 'released' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div>
                          <span className="font-semibold text-slate-200">
                            Escrow: {session.escrowStatus === 'held' ? 'Funds Securely Locked' : 'Funds Disbursed'}
                          </span>
                          <p className="text-xxxxs text-slate-500 mt-0.5">
                            {session.escrowStatus === 'held' 
                              ? 'Protected by TrustCoach contract. Escrow releases only when verified.' 
                              : `Paid to ${session.coachName}. Thank you for verifying.`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Escrow Control Buttons */}
                    {isUpcoming && (
                      <div className="flex gap-3 pt-1 border-t border-slate-800/60">
                        {/* Confirm release button */}
                        <button
                          onClick={() => confirmSession(session.id)}
                          className="flex-1 py-2 bg-emerald-650 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all-300 flex items-center justify-center space-x-1 shadow-sm hover:shadow-emerald-500/10"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Session Happened</span>
                        </button>
                        
                        {/* Dispute button */}
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to open a dispute? This will freeze the escrow payment and penalize the coach's Trust Score instantly by -10 points.")) {
                              disputeSession(session.id);
                            }
                          }}
                          className="py-2 px-3 border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-lg text-xs font-semibold transition-all-300 flex items-center justify-center space-x-1"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Dispute/Refund</span>
                        </button>
                      </div>
                    )}

                    {/* Review Form triggers if completed but not rated */}
                    {isCompleted && !session.ratingLeft && activeReviewSessionId !== session.id && (
                      <button
                        onClick={() => setActiveReviewSessionId(session.id)}
                        className="w-full py-2 border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-350 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Leave a Verified Review</span>
                      </button>
                    )}

                    {/* Review Submission Area */}
                    {activeReviewSessionId === session.id && (
                      <form onSubmit={(e) => handleReviewSubmit(e, session.id)} className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3 pt-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xxs font-bold text-slate-400 uppercase tracking-wide">Rate your session</label>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(num => (
                              <button
                                type="button"
                                key={num}
                                onClick={() => setReviewRating(num)}
                                className="focus:outline-none"
                              >
                                <Star className={`w-4 h-4 ${num <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xxxxs font-bold text-slate-500 uppercase tracking-wider mb-1">Feedback Comment</label>
                          <textarea
                            required
                            rows={2}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="How was the session? Be specific about what value the coach provided..."
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveReviewSessionId(null)}
                            className="px-3 py-1.5 text-xxs text-slate-400 hover:text-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded text-xxs transition-colors"
                          >
                            Submit Review
                          </button>
                        </div>
                      </form>
                    )}

                    {isCompleted && session.ratingLeft && (
                      <div className="text-xxs text-slate-500 italic bg-slate-950/20 p-2.5 rounded-lg border border-slate-850/30 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Verified review submitted. Thank you!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Goal Tracker Widget */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>Placement Targets</span>
              </h2>
              <button 
                onClick={() => setShowAddGoalModal(true)}
                className="p-1 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
              {goals.map(goal => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                
                return (
                  <div key={goal.id} className="space-y-2 bg-slate-950/40 border border-slate-850/60 p-3.5 rounded-xl">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300 line-clamp-1">{goal.title}</span>
                      <span className="text-indigo-400 shrink-0">{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>

                    {/* Increment Decrement Controls */}
                    <div className="flex items-center justify-between pt-1 text-xxs text-slate-500">
                      <span>{percent}% Completed</span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateGoalProgress(goal.id, goal.currentValue - 1)}
                          className="px-1.5 py-0.5 border border-slate-800 hover:border-slate-700 bg-slate-900 rounded font-semibold text-slate-400 hover:text-white"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => updateGoalProgress(goal.id, goal.currentValue + 1)}
                          className="px-1.5 py-0.5 border border-slate-800 hover:border-slate-700 bg-slate-900 rounded font-semibold text-slate-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Add Goal Modal Simulation */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create Target Goal</h3>
            
            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wide mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve Leetcode trees"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wide mb-1">Target Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wide mb-1">Unit</label>
                  <input
                    type="text"
                    value={newGoalUnit}
                    onChange={(e) => setNewGoalUnit(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow transition-colors"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
