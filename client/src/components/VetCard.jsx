import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Haversine distance in km
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SPEC_COLORS = {
  dogs: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  cats: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  exotic: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  birds: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  default: 'bg-slate-600/40 text-slate-300 border-slate-500/30',
};

const VetCard = ({ clinic, userLat, userLng }) => {
  const navigate = useNavigate();
  const rating = (4.5 + Math.random() * 0.5).toFixed(1);

  const distance =
    userLat && userLng && clinic.location?.coordinates?.length === 2
      ? haversine(userLat, userLng, clinic.location.coordinates[1], clinic.location.coordinates[0]).toFixed(1)
      : null;

  const availableSlots = (clinic.availableSlots || [])
    .filter((s) => !s.isBooked)
    .slice(0, 3);

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 flex flex-col gap-4 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg group-hover:text-rose-400 transition-colors line-clamp-1">
            {clinic.name}
          </h3>
          <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{clinic.address}</p>
        </div>
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1 flex-shrink-0">
          <span className="text-amber-400 text-xs">★</span>
          <span className="text-amber-300 text-xs font-bold">{rating}</span>
        </div>
      </div>

      {/* Specializations */}
      <div className="flex flex-wrap gap-2">
        {(clinic.specializations || []).map((spec) => (
          <span
            key={spec}
            className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${SPEC_COLORS[spec] || SPEC_COLORS.default}`}
          >
            {spec}
          </span>
        ))}
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        {distance && (
          <span className="flex items-center gap-1">
            📍 {distance} km away
          </span>
        )}
        {clinic.timings?.open && (
          <span className="flex items-center gap-1">
            🕐 {clinic.timings.open} – {clinic.timings.close}
          </span>
        )}
        {clinic.isVerified && (
          <span className="text-emerald-400 flex items-center gap-1">✓ Verified</span>
        )}
      </div>

      {/* Slots */}
      {availableSlots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSlots.map((slot, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 rounded-full font-medium"
            >
              {slot.day} {slot.time}
            </span>
          ))}
        </div>
      )}

      {/* Action */}
      <button
        onClick={() => navigate(`/vets/${clinic._id}`)}
        className="mt-auto w-full py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-500/20 transition-all"
      >
        Book Now →
      </button>
    </div>
  );
};

export default VetCard;
