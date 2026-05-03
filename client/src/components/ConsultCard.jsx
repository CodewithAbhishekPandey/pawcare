import React, { memo } from 'react';

const StarRating = ({ rating, size = 'sm' }) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push('★');
    else if (i === full + 1 && half) stars.push('½');
    else stars.push('☆');
  }

  return (
    <span className={`${textSize} text-amber-400`} aria-label={`${rating} out of 5 stars`}>
      {stars.map((s, i) => (
        <span key={i} style={{ letterSpacing: '1px' }}>{s === '½' ? '⭐' : s}</span>
      ))}
    </span>
  );
};

const ConsultCard = ({ vet, onConsult }) => {
  const initials = vet.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const colors = [
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-sky-500 to-blue-600',
  ];
  const colorClass = colors[vet.name.charCodeAt(0) % colors.length];

  return (
    <div className="group bg-slate-800/60 border border-slate-700/50 hover:border-rose-500/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-white font-bold text-lg leading-tight">{vet.name}</h3>
            {/* Available Now badge */}
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Available Now
            </span>
          </div>

          {/* Specializations */}
          {vet.specializations?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
              {vet.specializations.slice(0, 3).map((spec) => (
                <span key={spec} className="px-2.5 py-0.5 bg-slate-700/70 text-slate-300 rounded-full text-xs font-medium border border-slate-600/50">
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Rating + Fee row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <StarRating rating={vet.rating || 0} />
              <span className="text-slate-400 text-sm">
                {vet.rating?.toFixed(1) || '0.0'}
                {vet.totalRatings > 0 && (
                  <span className="text-slate-500 ml-1">({vet.totalRatings})</span>
                )}
              </span>
            </div>
            <span className="text-emerald-400 font-bold text-base">₹{vet.consultFee}</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        id={`consult-btn-${vet._id}`}
        onClick={() => onConsult(vet)}
        className="mt-4 w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 hover:-translate-y-0.5 active:translate-y-0"
      >
        <span>📹</span>
        <span>Consult Now · ₹{vet.consultFee}</span>
      </button>
    </div>
  );
};

export default memo(ConsultCard);
