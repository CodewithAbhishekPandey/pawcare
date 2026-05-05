import React, { useState, useMemo } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const STEPS = ['Select Time', 'Pet Info', 'Confirm'];
const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Other'];

const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const formatDate = (d) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
};
const getDayName = (d) => d.toLocaleDateString('en-US', { weekday: 'short' });
const getMonthName = (d) => d.toLocaleDateString('en-US', { month: 'short' });

const BookingForm = ({ clinic, preDate, preTime, onSuccess, onClose }) => {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState(preDate || '');
  const [timeSlot, setTimeSlot] = useState(preTime || '');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');

  const datesStrip = useMemo(() => generateDates(), []);

  // Normalize availableSlots — handles both string and object formats
  const availableSlots = useMemo(() => {
    const raw = clinic?.availableSlots || [];
    return raw
      .map((s) => (typeof s === 'string' ? { time: s, isBooked: false } : s))
      .filter((s) => s.time);
  }, [clinic]);

  const handleConfirm = async () => {
    if (!date) { setError('Please select a date.'); return; }
    if (!timeSlot) { setError('Please select a time slot.'); return; }
    if (!petName.trim()) { setError("Please enter your pet's name."); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/appointments', {
        clinicRef: clinic._id,
        date,
        timeSlot,
        petName,
        petType,
        notes,
      });
      setBookingId(res.data.data._id);
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-paw-teal font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-paw-teal/10 focus:border-paw-teal transition-all";

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="text-center py-8 px-4 bg-white rounded-3xl shadow-sm border border-stone-100">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-black text-paw-teal mb-2">Booking Confirmed!</h3>
        <p className="text-stone-500 font-medium mb-4">
          Appointment at <span className="text-paw-teal font-bold">{clinic.name}</span>
        </p>
        <div className="bg-stone-50 rounded-2xl p-4 my-4 border border-stone-100 text-left space-y-2">
          <p className="text-paw-teal font-medium">📅 <strong>{date}</strong> at <strong>{timeSlot}</strong></p>
          <p className="text-paw-teal font-medium">🐾 <strong>{petName}</strong> ({petType})</p>
          {notes && <p className="text-stone-400 text-sm italic">"{notes}"</p>}
        </div>
        <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mt-2">
          Booking ID: {bookingId.slice(-8).toUpperCase()}
        </p>
        <div className="flex gap-3 mt-6">
          <Link
            to="/appointments"
            className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-paw-teal font-bold rounded-2xl transition-colors text-sm text-center"
          >
            View Appointments
          </Link>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-2xl transition-all shadow-md text-sm active:scale-95"
          >
            Done ✓
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg border border-stone-100 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-paw-teal">Book Appointment</h2>
          <p className="text-stone-400 text-sm font-medium">{clinic.name}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-400 flex items-center justify-center transition-colors">
            ✕
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-paw-teal' : 'text-stone-300'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  i < step
                    ? 'bg-paw-teal border-paw-teal text-white'
                    : i === step
                    ? 'border-paw-teal text-paw-teal bg-paw-teal/10'
                    : 'border-stone-200 text-stone-400 bg-stone-50'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-bold hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-1 rounded-full ${i < step ? 'bg-paw-teal' : 'bg-stone-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Step 0: Select Time ── */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-3">Select Date</label>
            <div className="flex overflow-x-auto pb-4 gap-3 snap-x" style={{ scrollbarWidth: 'none' }}>
              {datesStrip.map((d, idx) => {
                const dateStr = formatDate(d);
                const isSelected = date === dateStr;
                return (
                  <button
                    key={idx}
                    onClick={() => setDate(dateStr)}
                    className={`snap-center shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-paw-teal border-paw-teal text-white shadow-md scale-105'
                        : 'bg-white border-stone-200 text-paw-teal hover:border-paw-teal/50 hover:bg-paw-teal/5'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getMonthName(d)}</span>
                    <span className="text-xl font-black my-0.5">{d.getDate()}</span>
                    <span className="text-[10px] font-semibold">{getDayName(d)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-3">Available Time Slots</label>
            {availableSlots.length === 0 ? (
              <div className="text-center p-6 bg-stone-50 rounded-2xl border border-stone-100">
                <p className="text-stone-400 text-sm font-medium">No slots configured for this clinic.</p>
                <p className="text-stone-300 text-xs mt-1">Enter a custom time below:</p>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className={`mt-3 ${inputCls}`}
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {availableSlots.map((slot, idx) => {
                  const isBooked = slot.isBooked;
                  const isSelected = timeSlot === slot.time && !isBooked;
                  return (
                    <button
                      key={idx}
                      disabled={isBooked}
                      onClick={() => setTimeSlot(slot.time)}
                      className={`py-3 px-2 rounded-2xl text-sm font-bold border transition-all ${
                        isBooked
                          ? 'bg-stone-50 border-stone-200 text-stone-300 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-paw-teal border-paw-teal text-white shadow-md'
                          : 'bg-white border-stone-200 text-paw-teal hover:border-paw-teal/50 hover:bg-paw-teal/5'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => { if (!date) { setError('Please select a date.'); return; } if (!timeSlot) { setError('Please select a time slot.'); return; } setError(''); setStep(1); }}
            disabled={!date || !timeSlot}
            className="w-full py-4 bg-paw-teal hover:bg-opacity-90 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-md active:scale-95"
          >
            Next →
          </button>
          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
        </div>
      )}

      {/* ── Step 1: Pet Info ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Pet Name *</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Bruno, Whiskers"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Pet Type</label>
            <select
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className={inputCls + ' appearance-none'}
            >
              {PET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your pet's condition or reason for visit..."
              rows={3}
              className={inputCls + ' resize-none'}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(0)} className="w-1/3 py-4 bg-stone-100 hover:bg-stone-200 text-paw-teal font-bold rounded-2xl transition-colors">
              ← Back
            </button>
            <button
              onClick={() => { if (!petName.trim()) { setError("Please enter your pet's name."); return; } setError(''); setStep(2); }}
              disabled={!petName.trim()}
              className="w-2/3 py-4 bg-paw-teal hover:bg-opacity-90 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-md active:scale-95"
            >
              Next →
            </button>
          </div>
          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
        </div>
      )}

      {/* ── Step 2: Confirm ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
            <h4 className="font-black text-paw-teal text-lg mb-4">Booking Summary</h4>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Clinic', value: clinic.name },
                { label: 'Address', value: clinic.address },
                { label: 'Date', value: date },
                { label: 'Time', value: timeSlot },
                { label: 'Pet', value: `${petName} (${petType})` },
                ...(notes ? [{ label: 'Notes', value: notes }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3">
                  <span className="text-stone-400 font-medium w-16 flex-shrink-0">{label}</span>
                  <span className="text-paw-teal font-bold flex-1">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="w-1/3 py-4 bg-stone-100 hover:bg-stone-200 text-paw-teal font-bold rounded-2xl transition-colors">
              ← Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-2/3 py-4 bg-paw-teal hover:bg-opacity-90 disabled:opacity-60 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
            >
              {loading ? 'Booking...' : '✓ Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
