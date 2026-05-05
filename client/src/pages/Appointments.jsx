import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  pending: 'bg-amber-50 border-amber-200 text-amber-700',
  confirmed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  completed: 'bg-sky-50 border-sky-200 text-sky-700',
  cancelled: 'bg-red-50 border-red-200 text-red-600',
};

const Appointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = () => {
    setLoading(true);
    // Fixed: use /appointments/me (not /appointments)
    api.get('/appointments/me')
      .then((res) => setAppointments(res.data.data || []))
      .catch(() => setError('Failed to load appointments. Make sure you are logged in.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
      fetchAppointments();
    } catch {
      alert('Failed to cancel appointment.');
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-20">
        <p className="text-5xl mb-4">🔒</p>
        <p className="text-paw-teal font-bold text-lg mb-4">Please log in to view your appointments.</p>
        <Link to="/login" className="px-6 py-3 bg-paw-teal text-white rounded-full font-bold shadow-md">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-serif font-black text-paw-teal mb-1">My Appointments</h1>
          <p className="text-stone-500 font-medium">Track and manage your vet visits</p>
        </div>
        <Link
          to="/appointments/new"
          className="px-5 py-2.5 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-full transition-all shadow-md text-sm"
        >
          + Book New
        </Link>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-stone-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium">{error}</div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-xl font-black text-paw-teal mb-2">No appointments yet</p>
          <p className="text-stone-400 text-sm mb-6 font-medium">Book your pet's first visit with a trusted vet in Gurugram</p>
          <div className="flex gap-3 justify-center">
            <Link to="/vets" className="px-6 py-3 bg-paw-teal hover:bg-opacity-90 text-white rounded-full font-bold shadow-md transition-all">
              Find a Vet
            </Link>
            <Link to="/appointments/new" className="px-6 py-3 bg-white border border-stone-200 hover:border-paw-teal text-paw-teal rounded-full font-bold transition-all">
              Book Directly
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white border border-stone-100 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h3 className="font-black text-paw-teal text-lg">{appt.clinicRef?.name || 'Unknown Clinic'}</h3>
                  <span className={`text-xs px-2.5 py-1 border rounded-full font-bold capitalize ${STATUS_STYLES[appt.status]}`}>
                    {appt.status}
                  </span>
                </div>
                {appt.clinicRef?.address && (
                  <p className="text-stone-400 text-sm font-medium mb-2">📍 {appt.clinicRef.address}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm font-medium">
                  <span className="text-paw-teal">🐾 <strong>{appt.petName}</strong> ({appt.petType})</span>
                  <span className="text-stone-500">📅 {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="text-stone-500">🕐 {appt.timeSlot}</span>
                </div>
                {appt.notes && (
                  <p className="text-stone-400 text-xs mt-2 italic">"{appt.notes}"</p>
                )}
              </div>
              {appt.status === 'pending' && (
                <button
                  onClick={() => handleCancel(appt._id)}
                  className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-2xl text-sm font-bold transition-colors flex-shrink-0"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
