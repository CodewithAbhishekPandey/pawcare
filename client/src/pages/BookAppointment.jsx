import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Other'];

const BookAppointment = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const prefilledClinic = searchParams.get('clinic') || '';
  const prefilledClinicName = searchParams.get('clinicName') || '';

  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState({
    clinicRef: prefilledClinic,
    date: '',
    timeSlot: '',
    petName: '',
    petType: 'Dog',
    notes: '',
  });
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/clinics').then((res) => setClinics(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.clinicRef) {
      const clinic = clinics.find((c) => c._id === form.clinicRef);
      setSlots(clinic?.availableSlots || []);
      setForm((f) => ({ ...f, timeSlot: '' }));
    }
  }, [form.clinicRef, clinics]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/appointments', form);
      setSuccess(true);
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-20">
        <p className="text-slate-400 text-lg mb-4">Please log in to book an appointment.</p>
        <a href="/login" className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold">Login</a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center mt-20 animate-pulse">
        <p className="text-5xl mb-4">✅</p>
        <h3 className="text-2xl font-bold text-white">Appointment Booked!</h3>
        <p className="text-slate-400 mt-2">Redirecting to your appointments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-3xl font-extrabold text-white mb-2">Book an Appointment</h2>
      <p className="text-slate-400 mb-8">Schedule a visit for your furry friend</p>

      {error && (
        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Select Clinic</label>
          <select
            name="clinicRef" value={form.clinicRef} onChange={handleChange} required
            className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          >
            <option value="">-- Choose a clinic --</option>
            {prefilledClinic && prefilledClinicName && (
              <option value={prefilledClinic}>{prefilledClinicName}</option>
            )}
            {clinics
              .filter((c) => c._id !== prefilledClinic)
              .map((c) => (
                <option key={c._id} value={c._id}>{c.name} — {c.address}</option>
              ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
            <input
              name="date" type="date" required value={form.date} onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Time Slot</label>
            {slots.length > 0 ? (
              <select
                name="timeSlot" value={form.timeSlot} onChange={handleChange} required
                className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              >
                <option value="">-- Pick slot --</option>
                {slots.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input
                name="timeSlot" type="text" required value={form.timeSlot} onChange={handleChange}
                placeholder="e.g. 10:00 AM"
                className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Pet Name</label>
            <input
              name="petName" type="text" required value={form.petName} onChange={handleChange}
              placeholder="Bruno"
              className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Pet Type</label>
            <select
              name="petType" value={form.petType} onChange={handleChange}
              className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            >
              {PET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Notes (optional)</label>
          <textarea
            name="notes" value={form.notes} onChange={handleChange} rows={3}
            placeholder="Describe symptoms or reason for visit..."
            className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-60 font-bold text-lg rounded-xl shadow-lg transition-all transform active:scale-95"
        >
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
