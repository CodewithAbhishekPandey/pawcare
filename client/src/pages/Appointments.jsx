import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  pending: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
  confirmed: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  completed: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  cancelled: 'bg-red-500/20 border-red-500/30 text-red-300',
};

const Appointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get('/appointments')
      .then((res) => setAppointments(res.data))
      .catch(() => setError('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="text-center mt-20">
        <p className="text-slate-400 text-lg mb-4">Please log in to view your appointments.</p>
        <Link to="/login" className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold">Login</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-white mb-1">My Appointments</h2>
          <p className="text-slate-400">Track and manage your vet visits</p>
        </div>
        <Link
          to="/appointments/new"
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg"
        >
          + Book New
        </Link>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-slate-800/40 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">{error}</div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-xl font-medium text-white mb-2">No appointments yet</p>
          <p className="text-slate-500 text-sm mb-6">Book your pet's first visit with a trusted vet</p>
          <Link to="/appointments/new" className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold">
            Book Now
          </Link>
        </div>
      )}

      {!loading && !error && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4 hover:border-slate-600 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-white text-lg">{appt.clinicRef?.name || 'Unknown Clinic'}</h3>
                  <span className={`text-xs px-2 py-0.5 border rounded-full font-medium ${STATUS_STYLES[appt.status]}`}>
                    {appt.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{appt.clinicRef?.address}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  <span className="text-slate-300">🐾 <strong>{appt.petName}</strong> ({appt.petType})</span>
                  <span className="text-slate-400">📅 {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="text-slate-400">🕐 {appt.timeSlot}</span>
                </div>
                {appt.notes && <p className="text-slate-500 text-xs mt-2 italic">"{appt.notes}"</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
