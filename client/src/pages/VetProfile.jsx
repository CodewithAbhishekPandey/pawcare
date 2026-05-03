import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';

const SPEC_COLORS = {
  dogs: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  cats: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  exotic: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  birds: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const VetProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get(`/vets/${id}`)
      .then((res) => setClinic(res.data.data))
      .catch(() => navigate('/vets'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 bg-slate-800/60 rounded-3xl" />
        <div className="h-32 bg-slate-800/40 rounded-2xl" />
        <div className="h-64 bg-slate-800/40 rounded-2xl" />
      </div>
    );
  }

  if (!clinic) return null;

  const [lng, lat] = clinic.location?.coordinates || [77.09, 28.47];
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

  const slotsByDay = DAYS.reduce((acc, day) => {
    acc[day] = (clinic.availableSlots || []).filter((s) => s.day === day);
    return acc;
  }, {});

  const handleSlotClick = (slot) => {
    if (slot.isBooked) return;
    if (!user) { navigate('/login'); return; }
    setSelectedSlot(slot);
    setShowModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-rose-900/40 via-slate-800 to-orange-900/30 border border-slate-700/50">
        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {(clinic.specializations || []).map((spec) => (
                  <span
                    key={spec}
                    className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${SPEC_COLORS[spec] || 'bg-slate-600/40 text-slate-300'}`}
                  >
                    {spec}
                  </span>
                ))}
                {clinic.isVerified && (
                  <span className="text-sm px-3 py-1 rounded-full font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    ✓ Verified
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{clinic.name}</h1>
              {clinic.ownerRef && (
                <p className="text-slate-300 mt-2 text-lg">Dr. {clinic.ownerRef.name}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
                <span className="text-amber-400">★★★★★</span>
                <span className="text-amber-300 font-bold">4.9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* About */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">About</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-slate-400 font-medium">Address</p>
                <p className="text-white">{clinic.address}</p>
              </div>
            </div>
            {clinic.timings?.open && (
              <div className="flex items-start gap-3">
                <span className="text-xl">🕐</span>
                <div>
                  <p className="text-slate-400 font-medium">Hours</p>
                  <p className="text-white">{clinic.timings.open} – {clinic.timings.close}</p>
                </div>
              </div>
            )}
            {clinic.ownerRef?.email && (
              <div className="flex items-start gap-3">
                <span className="text-xl">✉️</span>
                <div>
                  <p className="text-slate-400 font-medium">Contact</p>
                  <p className="text-white">{clinic.ownerRef.email}</p>
                </div>
              </div>
            )}
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors"
          >
            🗺️ Open in Google Maps →
          </a>
        </div>

        {/* Specializations */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Specializations</h2>
          <div className="flex flex-wrap gap-3">
            {(clinic.specializations || []).map((spec) => (
              <div
                key={spec}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium capitalize text-sm ${SPEC_COLORS[spec] || 'bg-slate-600/40 text-slate-300 border-slate-500/30'}`}
              >
                {spec === 'dogs' ? '🐕' : spec === 'cats' ? '🐈' : spec === 'birds' ? '🦜' : '🦎'}{' '}
                {spec}
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Click on a time slot below to book your appointment online.
          </p>
        </div>
      </div>

      {/* Weekly Slot Grid */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-6">Available Appointments</h2>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[600px]">
            {DAYS.map((day) => (
              <div key={day}>
                <p className="text-xs font-bold text-slate-400 mb-2 text-center">{day.slice(0, 3)}</p>
                <div className="space-y-1.5">
                  {slotsByDay[day].length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-2">—</p>
                  )}
                  {slotsByDay[day].map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSlotClick(slot)}
                      disabled={slot.isBooked}
                      className={`w-full text-xs py-1.5 px-2 rounded-lg font-medium transition-all ${
                        slot.isBooked
                          ? 'bg-slate-700/50 text-slate-600 cursor-not-allowed'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/40 cursor-pointer'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {!user && (
          <p className="text-center text-slate-400 text-sm mt-4">
            <button onClick={() => navigate('/login')} className="text-rose-400 hover:underline font-medium">Sign in</button> to book a slot
          </p>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl transition-colors"
            >✕</button>
            <h3 className="text-xl font-bold text-white mb-6">Book Appointment</h3>
            <BookingForm
              clinic={clinic}
              preDate=""
              preTime={selectedSlot.time}
              onSuccess={() => {}}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VetProfile;
