import React, { useState, useEffect } from 'react';
import { useAppState } from '../AppState';
import { getTrustLabel } from '../trustCalculator';
import { ShieldCheck, Calendar, Clock, Lock, ShieldAlert, CreditCard } from 'lucide-react';

export const BookingFlow: React.FC = () => {
  const { selectedCoach, setView, bookSession } = useAppState();
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('trustcoach_temp_slot');
    if (saved) {
      setSelectedSlot(JSON.parse(saved));
    }
  }, []);

  if (!selectedCoach || !selectedSlot) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Booking session expired. Please return to discovery.</p>
        <button onClick={() => setView('discovery')} className="mt-4 px-4 py-2 bg-indigo-650 rounded-lg text-white">
          Back to Discovery
        </button>
      </div>
    );
  }

  const isLowTrust = selectedCoach.trustScore < 70;
  const label = getTrustLabel(selectedCoach.trustScore);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate transaction
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
      
      // Complete booking state update
      setTimeout(() => {
        bookSession(selectedCoach.id, selectedSlot.date, selectedSlot.time);
        localStorage.removeItem('trustcoach_temp_slot');
      }, 1500);
    }, 2000);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title */}
      <h1 className="text-2xl font-bold text-white text-center mb-8">Secure Session Booking</h1>

      {paymentSuccess ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto shadow-2xl glow-green">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Payment Held in Escrow!</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your payment of <span className="text-white font-bold">₹{selectedCoach.pricePerSession}</span> is now locked safely in the TrustCoach escrow smart-contract. 
          </p>
          <div className="p-3 bg-slate-950 rounded-lg text-slate-500 text-xxs leading-normal text-left">
            {isLowTrust ? (
              <span className="text-amber-400 font-semibold">
                ⚠️ Locked Escrow: Funds will not be released to {selectedCoach.name} until you attend the session and click 'Confirm Completion' on your dashboard.
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                🛡️ Trusted Escrow: Standard auto-release active. Funds will release 24h after session completion unless you submit a refund dispute.
              </span>
            )}
          </div>
          <p className="text-xxs text-slate-500">Redirecting you to your dashboard...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Left Column: Escrow Concept Widget & Info (3 Cols) */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Booking Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Booking with</h2>
              <div className="flex items-center space-x-3.5 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAvatarGradient(selectedCoach.avatar)} flex items-center justify-center font-bold text-white text-sm`}>
                  {selectedCoach.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedCoach.name}</h3>
                  <span className="text-xxs text-slate-500">{selectedCoach.specialty.join(', ')}</span>
                </div>
                <div className={`ml-auto flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-xxs font-bold ${label.badgeClass}`}>
                  <span>{selectedCoach.trustScore}</span>
                </div>
              </div>

              {/* Slot Details */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-slate-955 border border-slate-850 p-2.5 rounded-lg flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-slate-500 text-xxs font-medium">DATE</div>
                    <span className="text-slate-300 font-semibold">{selectedSlot.date}</span>
                  </div>
                </div>
                <div className="bg-slate-955 border border-slate-850 p-2.5 rounded-lg flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-slate-500 text-xxs font-medium">TIME SLOT</div>
                    <span className="text-slate-300 font-semibold">{selectedSlot.time}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Explained Visualization */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>How TrustCoach Escrow Protects You</span>
              </h2>
              
              {/* Visual Escrow Flow Chart */}
              <div className="grid grid-cols-3 gap-2 text-center text-slate-400 relative pt-2">
                
                {/* Step 1 */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1 relative">
                  <div className="text-xxs font-bold text-indigo-400">1. Deposit</div>
                  <p className="text-xxxxs text-slate-500 leading-tight">Your funds are securely locked in escrow.</p>
                </div>
                
                {/* Step 2 */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1">
                  <div className="text-xxs font-bold text-indigo-400">2. Coaching</div>
                  <p className="text-xxxxs text-slate-500 leading-tight">Coach holds the session live.</p>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1">
                  <div className="text-xxs font-bold text-indigo-400">3. Release</div>
                  <p className="text-xxxxs text-slate-500 leading-tight">Funds unlock once you verify outcome.</p>
                </div>

              </div>

              {/* Dynamic Escrow Policy Warning Banner based on Trust Score */}
              {isLowTrust ? (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start space-x-3 glow-amber">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-amber-300">Payment Held Until Session Confirmed (High Protection)</div>
                    <p className="text-slate-400 leading-normal text-xxs">
                      Because {selectedCoach.name} has a Trust Score below 70 ({selectedCoach.trustScore}/100), we hold your payment in strict escrow. The coach will NOT get paid until you mark the session as complete in your dashboard. If the coach is a no-show, you can raise an instant full refund dispute.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-start space-x-3 glow-green">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-emerald-300">Fast Release — Trusted Coach (Standard Mode)</div>
                    <p className="text-slate-400 leading-normal text-xxs">
                      {selectedCoach.name} is a highly-rated, verified coach with a Trust Score of {selectedCoach.trustScore}/100. For verified coaches, payment is fast-tracked and will be automatically released to them 24 hours after the session is scheduled, unless you report a dispute or cancellation before then.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Payment Details Card (2 Cols) */}
          <div className="md:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-sm font-bold text-slate-350 border-b border-slate-800 pb-3">Payment Summary</h2>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-450">
                  <span>1 Hour Prep Session</span>
                  <span className="text-slate-300">₹{selectedCoach.pricePerSession}</span>
                </div>
                <div className="flex justify-between text-slate-450">
                  <span>Escrow Service Fee</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between font-bold text-sm text-white">
                  <span>Total Due</span>
                  <span className="text-indigo-400">₹{selectedCoach.pricePerSession}</span>
                </div>
              </div>

              {/* Secure payment form simulation */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-3">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                    <input 
                      type="text" 
                      required 
                      defaultValue="Rahul Dev"
                      className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-250 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mock Card Details</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input 
                        type="text" 
                        required 
                        placeholder="4242 4242 4242 4242"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-250 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="MM/YY"
                        className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-250 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CVC</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="•••"
                        className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-250 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs" 
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full py-3 rounded-xl font-bold text-xs text-center text-white flex items-center justify-center space-x-2 transition-all-300 shadow-md ${
                    processing 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-indigo-650 hover:bg-indigo-600 cursor-pointer hover:shadow-indigo-500/20'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{processing ? 'Processing Securely...' : `Deposit ₹${selectedCoach.pricePerSession} in Escrow`}</span>
                </button>
              </form>
              
              <div className="flex items-center justify-center space-x-1.5 text-slate-500 text-xxs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL Encrypted & PCI Compliant Sandbox</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
