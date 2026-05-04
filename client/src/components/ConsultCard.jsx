import React, { memo } from 'react';

const StarRating = ({ rating, size = 'sm' }) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push('★');
    else if (i === full + 1 && half) stars.push('⭐');
    else stars.push('☆');
  }

  return (
    <span className={`${textSize} text-amber-500`} aria-label={`${rating} out of 5 stars`}>
      {stars.map((s, i) => (
        <span key={i} style={{ letterSpacing: '1px' }}>{s}</span>
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
    'from-paw-orange to-amber-500',
    'from-paw-teal to-teal-400',
    'from-violet-500 to-purple-400',
    'from-emerald-500 to-teal-400',
    'from-sky-500 to-blue-400',
  ];
  const colorClass = colors[vet.name.charCodeAt(0) % colors.length];

  return (
    <div className="group bg-white border border-stone-100 hover:border-paw-teal/30 rounded-3xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-paw-teal/5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-md`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-paw-teal font-black text-lg leading-tight">{vet.name}</h3>
            {/* Available Now badge */}
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available Now
            </span>
          </div>

          {/* Specializations */}
          {vet.specializations?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
              {vet.specializations.slice(0, 3).map((spec) => (
                <span key={spec} className="px-2.5 py-0.5 bg-stone-50 text-stone-500 rounded-full text-xs font-bold border border-stone-200">
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Rating + Fee row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <StarRating rating={vet.rating || 0} />
              <span className="text-stone-400 text-sm font-medium">
                {vet.rating?.toFixed(1) || '0.0'}
                {vet.totalRatings > 0 && (
                  <span className="text-stone-300 ml-1">({vet.totalRatings})</span>
                )}
              </span>
            </div>
            <span className="text-emerald-700 font-black text-base">₹{vet.consultFee}</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        id={`consult-btn-${vet._id}`}
        onClick={() => onConsult(vet)}
        className="mt-4 w-full py-3 bg-paw-teal hover:bg-opacity-90 text-white font-black rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-paw-teal/20 hover:-translate-y-0.5 active:translate-y-0"
      >
        <span>📹</span>
        <span>Consult Now · ₹{vet.consultFee}</span>
      </button>
    </div>
  );
};

export default memo(ConsultCard);
