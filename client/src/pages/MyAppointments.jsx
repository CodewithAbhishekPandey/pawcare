import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  completed: 'bg-stone-100 text-stone-500 border border-stone-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

const AppointmentCard = ({ apt, onCancel }) => {
  const isPast = new Date(apt.date) < new Date();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return;
    setCancelling(true);
    await onCancel(apt._id);
    setCancelling(false);
  };

  return (
    <div className="bg-white border border-stone-100 rounded-3xl p-6 flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-paw-teal text-lg">{apt.clinicRef?.name || 'Clinic'}</h3>
            <p className="text-stone-400 text-sm">{apt.clinicRef?.address}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${STATUS_STYLES[apt.status]}`}>
            {apt.status}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-stone-600 font-medium">
          <span>📅 {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>🕐 {apt.timeSlot}</span>
          <span>🐾 {apt.petName} ({apt.petType})</span>
        </div>
        {apt.notes && <p className="mt-2 text-stone-400 text-sm italic">{apt.notes}</p>}
      </div>
      {apt.status === 'pending' && !isPast && (
        <div className="flex sm:flex-col items-start gap-2">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-2xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling…' : 'Cancel'}
          </button>
        </div>
      )}
    </div>
  );
};

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/me');
      setAppointments(res.data.data || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
    fetchAppointments();
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-2xl font-bold text-paw-teal mb-2">Sign in to view appointments</h2>
        <Link to="/login" className="mt-4 inline-block px-6 py-3 bg-paw-teal text-white font-bold rounded-full shadow-md">Sign In</Link>
      </div>
    );
  }

  const upcoming = appointments.filter((a) => ['pending', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date());
  const past = appointments.filter((a) => !upcoming.includes(a));

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-stone-100 rounded-3xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-serif font-black text-paw-teal mb-8">My Appointments 📅</h1>

      {appointments.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📅</p>
          <h2 className="text-xl font-bold text-paw-teal mb-2">No appointments yet</h2>
          <p className="text-stone-500 mb-6">Book your first vet appointment today.</p>
          <Link to="/vets" className="px-6 py-3 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-full transition-all shadow-md">
            Find a Vet
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-paw-teal mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Upcoming
          </h2>
          <div className="space-y-4">
            {upcoming.map((apt) => <AppointmentCard key={apt._id} apt={apt} onCancel={handleCancel} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-stone-400 mb-4">Past</h2>
          <div className="space-y-4">
            {past.map((apt) => <AppointmentCard key={apt._id} apt={apt} onCancel={handleCancel} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default MyAppointments;
