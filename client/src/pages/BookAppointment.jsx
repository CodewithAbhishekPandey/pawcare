import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

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
      const raw = clinic?.availableSlots || [];
      // availableSlots may be objects {day, time, isBooked} or plain strings
      const times = raw
        .filter((s) => typeof s === 'string' ? s : !s.isBooked)
        .map((s) => typeof s === 'string' ? s : s.time)
        .filter(Boolean);
      setSlots([...new Set(times)]);
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
      setTimeout(() => navigate('/appointments'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-20">
        <p className="text-5xl mb-4">🔒</p>
        <p className="text-paw-teal font-bold text-lg mb-4">Please log in to book an appointment.</p>
        <Link to="/login" className="px-6 py-3 bg-paw-teal text-white rounded-full font-bold shadow-md">Login</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center mt-20">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-black text-paw-teal">Appointment Booked!</h3>
        <p className="text-stone-500 mt-2 font-medium">Redirecting to your appointments...</p>
      </div>
    );
  }

  const inputCls = "block w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-paw-teal placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-paw-teal/10 focus:border-paw-teal transition-all font-medium";
  const labelCls = "block text-sm font-bold text-stone-700 mb-2";

  return (
    <div className="max-w-xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-black text-paw-teal mb-2">Book an Appointment 📅</h1>
        <p className="text-stone-500 font-medium">Schedule a visit for your furry friend</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-stone-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div>
          <label className={labelCls}>Select Clinic</label>
          <select
            name="clinicRef" value={form.clinicRef} onChange={handleChange} required
            className={inputCls}
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
            <label className={labelCls}>Date</label>
            <input
              name="date" type="date" required value={form.date} onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Time Slot</label>
            {slots.length > 0 ? (
              <select
                name="timeSlot" value={form.timeSlot} onChange={handleChange} required
                className={inputCls}
              >
                <option value="">-- Pick slot --</option>
                {slots.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input
                name="timeSlot" type="text" required value={form.timeSlot} onChange={handleChange}
                placeholder="e.g. 10:00 AM"
                className={inputCls}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Pet Name</label>
            <input
              name="petName" type="text" required value={form.petName} onChange={handleChange}
              placeholder="Bruno"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Pet Type</label>
            <select
              name="petType" value={form.petType} onChange={handleChange}
              className={inputCls}
            >
              {PET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Notes (optional)</label>
          <textarea
            name="notes" value={form.notes} onChange={handleChange} rows={3}
            placeholder="Describe symptoms or reason for visit..."
            className={inputCls + ' resize-none'}
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 bg-paw-teal hover:bg-opacity-90 disabled:opacity-60 text-white font-black text-lg rounded-2xl shadow-lg shadow-paw-teal/20 transition-all transform active:scale-95"
        >
          {loading ? 'Booking...' : '✓ Confirm Appointment'}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
