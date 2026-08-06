import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppState';
import { getTrustLabel } from '../trustCalculator';
import { Search, Star, ShieldCheck, ArrowUpDown, Filter, SlidersHorizontal, BookOpen } from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const { coaches, setView } = useAppState();
  
  // Local filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [trustFilter, setTrustFilter] = useState<'all' | 'high' | 'mid' | 'new'>('all');
  const [sortBy, setSortBy] = useState<'trust-desc' | 'price-asc' | 'price-desc' | 'rating-desc'>('trust-desc');
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  // Extract all unique specialties from coaches for filter checkboxes
  const allSpecialties = useMemo(() => {
    const specs = new Set<string>();
    coaches.forEach(c => c.specialty.forEach(s => specs.add(s)));
    return Array.from(specs);
  }, [coaches]);

  // Filter & Sort Logic
  const filteredCoaches = useMemo(() => {
    return coaches
      .filter(coach => {
        // 1. Search Query
        const matchesSearch = 
          coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coach.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
          coach.bio.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 2. Specialty Filters
        const matchesSpecialty = 
          selectedSpecialties.length === 0 || 
          selectedSpecialties.some(s => coach.specialty.includes(s));
        
        // 3. Trust Filter
        const matchesTrust = 
          trustFilter === 'all' ||
          (trustFilter === 'high' && coach.trustScore >= 80) ||
          (trustFilter === 'mid' && coach.trustScore >= 50 && coach.trustScore < 80) ||
          (trustFilter === 'new' && coach.trustScore < 50);

        // 4. Price Filter
        const matchesPrice = coach.pricePerSession <= maxPrice;

        return matchesSearch && matchesSpecialty && matchesTrust && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'trust-desc') return b.trustScore - a.trustScore;
        if (sortBy === 'price-asc') return a.pricePerSession - b.pricePerSession;
        if (sortBy === 'price-desc') return b.pricePerSession - a.pricePerSession;
        if (sortBy === 'rating-desc') return b.rating - a.rating;
        return 0;
      });
  }, [coaches, searchQuery, selectedSpecialties, trustFilter, sortBy, maxPrice]);

  const handleSpecialtyToggle = (spec: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header and Hero Block */}
      <div className="mb-10 text-center md:text-left md:flex md:items-center md:justify-between border-b border-slate-800 pb-8">
        <div className="md:max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Find Verified Placement Coaches
          </h1>
          <p className="mt-3 text-lg text-slate-400">
            Real-time, audited Trust Scores based on identity verification, completed sessions, and proven student job offers. Escrow payments protect every booking.
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex flex-col items-center md:items-end bg-slate-900 border border-slate-800 p-4 rounded-xl max-w-sm">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span>Escrow Protected Platform</span>
          </div>
          <span className="text-xs text-slate-500 text-center md:text-right">
            Coaches with a score below 70 are held in escrow until you confirm the session occurred.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit sticky top-24">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Filters</span>
            </h2>
            <button 
              onClick={() => {
                setSelectedSpecialties([]);
                setTrustFilter('all');
                setMaxPrice(2000);
                setSearchQuery('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Specialties Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Specialty</span>
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {allSpecialties.map(spec => (
                <label key={spec} className="flex items-center space-x-2.5 text-sm text-slate-400 hover:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(spec)}
                    onChange={() => handleSpecialtyToggle(spec)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-2 w-4 h-4"
                  />
                  <span>{spec}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Trust Score Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trust Level</span>
            </h3>
            <div className="space-y-2">
              {[
                { val: 'all', label: 'All Levels' },
                { val: 'high', label: 'Highly Trusted (80+)' },
                { val: 'mid', label: 'Verified Coach (50-79)' },
                { val: 'new', label: 'New Coach (<50)' }
              ].map(item => (
                <label key={item.val} className="flex items-center space-x-2.5 text-sm text-slate-400 hover:text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="trust-filter"
                    checked={trustFilter === item.val}
                    onChange={() => setTrustFilter(item.val as any)}
                    className="border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-2 w-4 h-4"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
              <span>Max Price</span>
              <span className="text-indigo-400">₹{maxPrice} / hr</span>
            </div>
            <input
              type="range"
              min="500"
              max="2000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>₹500</span>
              <span>₹2000</span>
            </div>
          </div>
        </div>

        {/* Coach Grid Section */}
        <div className="lg:col-span-3">
          {/* Search and Sort Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                id="search-bar-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coaches by name, skills, bio..."
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all-300 text-sm"
              />
            </div>
            <div className="relative min-w-[200px] flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300">
              <ArrowUpDown className="w-4 h-4 text-slate-500 mr-2" />
              <select
                id="sort-select-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-slate-300 focus:outline-none focus:ring-0 w-full cursor-pointer pr-4"
              >
                <option value="trust-desc" className="bg-slate-900">Sort: Trust Score (High)</option>
                <option value="price-asc" className="bg-slate-900">Sort: Price (Low to High)</option>
                <option value="price-desc" className="bg-slate-900">Sort: Price (High to Low)</option>
                <option value="rating-desc" className="bg-slate-900">Sort: Highest Rating</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-slate-400">
            Showing <span className="text-slate-200 font-semibold">{filteredCoaches.length}</span> coaches
          </div>

          {/* Coach Card Grid */}
          {filteredCoaches.length === 0 ? (
            <div className="text-center py-16 bg-slate-905 border border-dashed border-slate-800 rounded-2xl">
              <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300">No coaches match your filters</h3>
              <p className="text-slate-500 text-sm mt-1">Try resetting the search query or adjusting your trust requirements.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCoaches.map(coach => {
                const label = getTrustLabel(coach.trustScore);
                
                return (
                  <div 
                    key={coach.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
                  >
                    {/* Trust Indicator Highlight Side Border */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                      label.color === 'green' ? 'bg-emerald-500' :
                      label.color === 'amber' ? 'bg-amber-500' : 'bg-slate-700'
                    }`} />

                    <div>
                      {/* Top Row: Avatar & Trust Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3.5">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(coach.avatar)} flex items-center justify-center font-bold text-white shadow-md text-base`}>
                            {coach.avatar}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base hover:text-indigo-400 transition-colors flex items-center cursor-pointer" onClick={() => setView('profile', coach)}>
                              {coach.name}
                            </h3>
                            <div className="flex items-center text-xs text-slate-400 mt-0.5">
                              {coach.rating > 0 ? (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                  <span className="text-slate-200 font-semibold">{coach.rating}</span>
                                  <span className="text-slate-500">({coach.reviews.length})</span>
                                </div>
                              ) : (
                                <span className="text-slate-500">No reviews yet</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Color-Coded Trust Badge */}
                        <div className={`flex flex-col items-end`}>
                          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border text-xs font-bold ${label.badgeClass}`}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{coach.trustScore} / 100</span>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 font-medium">{label.text}</span>
                        </div>
                      </div>

                      {/* Bio Snippet */}
                      <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">
                        {coach.bio}
                      </p>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {coach.specialty.map(spec => (
                          <span 
                            key={spec} 
                            className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-medium rounded-md hover:border-slate-700 hover:text-slate-300 transition-colors"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Row: Price & Action */}
                    <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Per Session</span>
                        <div className="text-lg font-extrabold text-white">
                          ₹{coach.pricePerSession}
                        </div>
                      </div>

                      <button
                        onClick={() => setView('profile', coach)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all-300 flex items-center space-x-1"
                      >
                        <span>View Profile</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
