import React, { useState } from 'react';
import api from '../api/axios';

const STEPS = ['Select Time', 'Pet Info', 'Confirm'];

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

  const availableSlots = (clinic?.availableSlots || []).filter((s) => !s.isBooked);
  const todayStr = new Date().toISOString().split('T')[0];

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
      <div className="text-center py-6 px-4">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
        <p className="text-slate-400 mb-2">
          Appointment at <span className="text-white font-medium">{clinic.name}</span>
        </p>
        <p className="text-slate-400 text-sm mb-1">
          📅 {date} at {timeSlot} &nbsp;|&nbsp; 🐾 {petName} ({petType})
        </p>
        <p className="text-xs text-slate-500 mt-3">Booking ID: {bookingId.slice(-8).toUpperCase()}</p>
        <button
          onClick={onClose}
          className="mt-6 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center gap-2 ${i <= step ? 'text-rose-400' : 'text-slate-600'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  i < step
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : i === step
                    ? 'border-rose-400 text-rose-400'
                    : 'border-slate-600 text-slate-600'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < step ? 'bg-rose-500' : 'bg-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Select Time */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Date</label>
            <input
              type="date"
              value={date}
              min={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Available Time Slots</label>
            {availableSlots.length === 0 ? (
              <p className="text-slate-500 text-sm">No slots available. Please check back later.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTimeSlot(slot.time)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                      timeSlot === slot.time
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-rose-500/50'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setStep(1)}
            disabled={!date || !timeSlot}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 1: Pet Info */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Pet Name</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Bruno, Whiskers"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Pet Type</label>
            <select
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your pet's condition or reason for visit..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors">
              ← Back
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!petName.trim()}
              className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-slate-800 rounded-2xl p-5 space-y-3 border border-slate-700">
            <h4 className="font-bold text-white text-lg mb-4">Booking Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-slate-400">Clinic</span>
              <span className="text-white font-medium">{clinic.name}</span>
              <span className="text-slate-400">Date</span>
              <span className="text-white font-medium">{date}</span>
              <span className="text-slate-400">Time</span>
              <span className="text-white font-medium">{timeSlot}</span>
              <span className="text-slate-400">Pet</span>
              <span className="text-white font-medium">{petName} ({petType})</span>
              {notes && (
                <>
                  <span className="text-slate-400">Notes</span>
                  <span className="text-white text-xs">{notes}</span>
                </>
              )}
            </div>
          </div>
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors">
              ← Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {loading ? 'Booking...' : 'Confirm Booking ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
