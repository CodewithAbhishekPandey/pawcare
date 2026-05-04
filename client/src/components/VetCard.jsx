import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  dogs: 'bg-amber-50 text-amber-700 border-amber-200',
  cats: 'bg-purple-50 text-purple-700 border-purple-200',
  exotic: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  birds: 'bg-sky-50 text-sky-700 border-sky-200',
  default: 'bg-stone-50 text-stone-600 border-stone-200',
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
    <div className="bg-white border border-stone-100 rounded-3xl p-6 hover:border-paw-teal/40 hover:shadow-xl hover:shadow-paw-teal/5 transition-all duration-300 flex flex-col gap-4 group shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-paw-teal text-lg group-hover:text-paw-orange transition-colors line-clamp-1">
            {clinic.name}
          </h3>
          <p className="text-stone-400 text-sm mt-0.5 line-clamp-1">{clinic.address}</p>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-2 py-1 flex-shrink-0">
          <span className="text-amber-500 text-xs">★</span>
          <span className="text-amber-600 text-xs font-bold">{rating}</span>
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
      <div className="flex items-center gap-4 text-xs text-stone-400 font-medium">
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
          <span className="text-emerald-600 flex items-center gap-1">✓ Verified</span>
        )}
      </div>

      {/* Slots */}
      {availableSlots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSlots.map((slot, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium"
            >
              {slot.day} {slot.time}
            </span>
          ))}
        </div>
      )}

      {/* Action */}
      <button
        onClick={() => navigate(`/vets/${clinic._id}`)}
        className="mt-auto w-full py-2.5 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-2xl text-sm shadow-md shadow-paw-teal/20 transition-all active:scale-95"
      >
        Book Now →
      </button>
    </div>
  );
};

export default VetCard;
