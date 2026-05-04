import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';

const SPEC_COLORS = {
  dogs: 'bg-amber-50 text-amber-700 border-amber-200',
  cats: 'bg-purple-50 text-purple-700 border-purple-200',
  exotic: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  birds: 'bg-sky-50 text-sky-700 border-sky-200',
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
        <div className="h-48 bg-stone-100 rounded-3xl" />
        <div className="h-32 bg-stone-100 rounded-3xl" />
        <div className="h-64 bg-stone-100 rounded-3xl" />
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
    <div className="max-w-4xl mx-auto pb-24">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-paw-teal to-paw-teal/70 border border-paw-teal/20">
        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {(clinic.specializations || []).map((spec) => (
                  <span
                    key={spec}
                    className="text-sm px-3 py-1 rounded-full font-bold capitalize bg-white/20 text-white border border-white/30"
                  >
                    {spec}
                  </span>
                ))}
                {clinic.isVerified && (
                  <span className="text-sm px-3 py-1 rounded-full font-bold bg-emerald-400/20 text-emerald-100 border border-emerald-400/30">
                    ✓ Verified
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{clinic.name}</h1>
              {clinic.ownerRef && (
                <p className="text-white/80 mt-2 text-lg font-medium">Dr. {clinic.ownerRef.name}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 rounded-2xl px-4 py-2">
                <span className="text-amber-300">★★★★★</span>
                <span className="text-amber-200 font-bold">4.9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* About */}
        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-black text-paw-teal mb-4">About</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-stone-400 font-medium">Address</p>
                <p className="text-paw-teal font-bold">{clinic.address}</p>
              </div>
            </div>
            {clinic.timings?.open && (
              <div className="flex items-start gap-3">
                <span className="text-xl">🕐</span>
                <div>
                  <p className="text-stone-400 font-medium">Hours</p>
                  <p className="text-paw-teal font-bold">{clinic.timings.open} – {clinic.timings.close}</p>
                </div>
              </div>
            )}
            {clinic.ownerRef?.email && (
              <div className="flex items-start gap-3">
                <span className="text-xl">✉️</span>
                <div>
                  <p className="text-stone-400 font-medium">Contact</p>
                  <p className="text-paw-teal font-bold">{clinic.ownerRef.email}</p>
                </div>
              </div>
            )}
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center gap-2 text-paw-orange hover:text-paw-teal text-sm font-bold transition-colors"
          >
            🗺️ Open in Google Maps →
          </a>
        </div>

        {/* Specializations */}
        <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-black text-paw-teal mb-4">Specializations</h2>
          <div className="flex flex-wrap gap-3">
            {(clinic.specializations || []).map((spec) => (
              <div
                key={spec}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold capitalize text-sm ${SPEC_COLORS[spec] || 'bg-stone-50 text-stone-600 border-stone-200'}`}
              >
                {spec === 'dogs' ? '🐕' : spec === 'cats' ? '🐈' : spec === 'birds' ? '🦜' : '🦎'}{' '}
                {spec}
              </div>
            ))}
          </div>
          <p className="text-stone-400 text-sm mt-4 font-medium">
            Click on a time slot below to book your appointment.
          </p>
        </div>
      </div>

      {/* Weekly Slot Grid */}
      <div className="bg-white border border-stone-100 rounded-3xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-black text-paw-teal mb-6">Available Appointments</h2>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[600px]">
            {DAYS.map((day) => (
              <div key={day}>
                <p className="text-xs font-bold text-stone-400 mb-2 text-center">{day.slice(0, 3)}</p>
                <div className="space-y-1.5">
                  {slotsByDay[day].length === 0 && (
                    <p className="text-xs text-stone-200 text-center py-2">—</p>
                  )}
                  {slotsByDay[day].map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSlotClick(slot)}
                      disabled={slot.isBooked}
                      className={`w-full text-xs py-1.5 px-2 rounded-xl font-bold transition-all ${
                        slot.isBooked
                          ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-500 hover:text-white cursor-pointer'
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
          <p className="text-center text-stone-400 text-sm mt-4 font-medium">
            <button onClick={() => navigate('/login')} className="text-paw-teal hover:underline font-bold">Sign in</button> to book a slot
          </p>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg">
            <BookingForm
              clinic={clinic}
              preDate=""
              preTime={selectedSlot.time}
              onSuccess={() => setShowModal(false)}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VetProfile;
