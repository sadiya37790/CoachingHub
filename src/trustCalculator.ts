import type { TrustComponents } from './types';

export function calculateTrustScore(components: TrustComponents): number {
  let score = 0;

  // 1. ID Verification (20 points)
  if (components.idVerified) {
    score += 20;
  }

  // 2. Certificate Uploaded (20 points)
  if (components.certificatesUploaded) {
    score += 20;
  }

  // 3. Sessions Completed (up to 30 points)
  // 3 points per completed session, max 30 points (10 sessions)
  const sessionPoints = Math.min(30, components.sessionsCompletedCount * 3);
  score += sessionPoints;

  // 4. Verified Outcome Proof (20 points)
  // 10 points per verified placement outcome, max 20 points (2 outcomes)
  const outcomePoints = Math.min(20, components.verifiedPlacementsCount * 10);
  score += outcomePoints;

  // 5. No Refund Disputes (10 points)
  if (components.noRefundDisputes) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

export interface TrustLabel {
  text: string;
  color: 'green' | 'amber' | 'gray';
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
}

export function getTrustLabel(score: number): TrustLabel {
  if (score >= 80) {
    return {
      text: 'Highly Trusted',
      color: 'green',
      bgClass: 'bg-emerald-950/40',
      borderClass: 'border-emerald-500/40',
      textClass: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
  } else if (score >= 50) {
    return {
      text: 'Verified Coach',
      color: 'amber',
      bgClass: 'bg-amber-950/40',
      borderClass: 'border-amber-500/40',
      textClass: 'text-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    };
  } else {
    return {
      text: 'New — limited track record',
      color: 'gray',
      bgClass: 'bg-slate-900',
      borderClass: 'border-slate-700',
      textClass: 'text-slate-400',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700'
    };
  }
}
