import React, { useState, useMemo } from 'react';
import api from '../api/axios';

const STEPS = ['Select Time', 'Pet Info', 'Confirm'];

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
  const localISOTime = new Date(d.getTime() - offset).toISOString().split('T')[0];
  return localISOTime;
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

  // Mock booked slots randomly or fetch from actual logic if available
  const availableSlots = (clinic?.availableSlots || []).map(s => ({
    ...s,
    // Just mapping original isBooked, but if missing, fallback to false
    isBooked: !!s.isBooked
  }));

  const handleConfirm = async () => {
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
      setStep(3); // success step
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (step === 3) {
    return (
      <div className="text-center py-8 px-4 bg-white rounded-3xl shadow-sm border border-stone-100">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Booking Confirmed!</h3>
        <p className="text-slate-500 mb-2 font-medium">
          Appointment at <span className="text-emerald-700 font-bold">{clinic.name}</span>
        </p>
        <div className="bg-stone-50 rounded-2xl p-4 my-4 border border-stone-200">
          <p className="text-slate-700 font-medium mb-1">
            📅 {date} at {timeSlot}
          </p>
          <p className="text-slate-700 font-medium">
            🐾 {petName} ({petType})
          </p>
        </div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-3">Booking ID: {bookingId.slice(-8)}</p>
        <button
          onClick={onClose}
          className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-sm active:scale-95 w-full"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-stone-200 p-6 md:p-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center gap-2 ${i <= step ? 'text-emerald-700' : 'text-stone-400'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  i < step
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : i === step
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : 'border-stone-300 text-stone-400 bg-stone-50'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-bold hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-1 rounded-full ${i < step ? 'bg-emerald-500' : 'bg-stone-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Select Time */}
      {step === 0 && (
        <div className="space-y-6">
          {/* Calendar Strip */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Select Date</label>
            <div className="flex overflow-x-auto pb-4 gap-3 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {datesStrip.map((d, idx) => {
                const dateStr = formatDate(d);
                const isSelected = date === dateStr;
                return (
                  <button
                    key={idx}
                    onClick={() => setDate(dateStr)}
                    className={`snap-center shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md transform scale-105'
                        : 'bg-white border-stone-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
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
            <label className="block text-sm font-bold text-slate-700 mb-3">Available Time Slots</label>
            {availableSlots.length === 0 ? (
              <p className="text-slate-500 text-sm bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center font-medium">No slots configured by clinic. Please try another day.</p>
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
                          ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                          : 'bg-white border-stone-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
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
            onClick={() => setStep(1)}
            disabled={!date || !timeSlot}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-sm active:scale-95"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 1: Pet Info */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Pet Name</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Bruno, Whiskers"
              className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Pet Type</label>
            <select
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none"
            >
              {['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your pet's condition or reason for visit..."
              rows={3}
              className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(0)} className="w-1/3 py-4 bg-stone-100 hover:bg-stone-200 text-slate-600 font-bold rounded-2xl transition-colors">
              ← Back
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!petName.trim()}
              className="w-2/3 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-sm active:scale-95"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-stone-50 rounded-3xl p-6 space-y-4 border border-stone-200">
            <h4 className="font-black text-slate-800 text-xl tracking-tight mb-2">Booking Summary</h4>
            <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-sm">
              <span className="text-slate-500 font-medium col-span-1">Clinic</span>
              <span className="text-slate-800 font-bold col-span-2">{clinic.name}</span>
              
              <span className="text-slate-500 font-medium col-span-1">Date</span>
              <span className="text-slate-800 font-bold col-span-2">{date}</span>
              
              <span className="text-slate-500 font-medium col-span-1">Time</span>
              <span className="text-slate-800 font-bold col-span-2">{timeSlot}</span>
              
              <span className="text-slate-500 font-medium col-span-1">Pet</span>
              <span className="text-slate-800 font-bold col-span-2">{petName} ({petType})</span>
              
              {notes && (
                <>
                  <span className="text-slate-500 font-medium col-span-1">Notes</span>
                  <span className="text-slate-700 italic col-span-2">{notes}</span>
                </>
              )}
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="w-1/3 py-4 bg-stone-100 hover:bg-stone-200 text-slate-600 font-bold rounded-2xl transition-colors">
              ← Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-2/3 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold rounded-2xl shadow-sm transition-all active:scale-95"
            >
              {loading ? 'Processing...' : 'Confirm ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
