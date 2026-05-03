import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const SPECIALIZATION_ICONS = {
  'General': '🏥',
  'Dermatology': '🔬',
  'Dentistry': '🦷',
  'Surgery': '⚕️',
  'Ophthalmology': '👁️',
  'Cardiology': '❤️',
  'Orthopedics': '🦴',
  'Nutrition': '🥗',
};

const ClinicCard = ({ clinic }) => (
  <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:border-rose-500/40 hover:shadow-rose-500/10 hover:shadow-xl transition-all duration-300 group">
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">{clinic.name}</h3>
      {clinic.isVerified && (
        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full font-medium">
          ✓ Verified
        </span>
      )}
    </div>
    <p className="text-slate-400 text-sm mb-3 flex items-center gap-2">
      <span>📍</span> {clinic.address}
    </p>
    {clinic.timings?.open && (
      <p className="text-slate-500 text-xs mb-4 flex items-center gap-2">
        <span>🕐</span> {clinic.timings.open} – {clinic.timings.close}
      </p>
    )}
    {clinic.specializations?.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {clinic.specializations.map((s) => (
          <span key={s} className="text-xs px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-full">
            {SPECIALIZATION_ICONS[s] || '🐾'} {s}
          </span>
        ))}
      </div>
    )}
    {clinic.availableSlots?.length > 0 && (
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Available Slots</p>
        <div className="flex flex-wrap gap-2">
          {clinic.availableSlots.slice(0, 4).map((slot) => (
            <span key={slot} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-lg">{slot}</span>
          ))}
          {clinic.availableSlots.length > 4 && (
            <span className="text-xs px-2 py-1 bg-slate-700 text-slate-500 rounded-lg">+{clinic.availableSlots.length - 4} more</span>
          )}
        </div>
      </div>
    )}
    <Link
      to={`/appointments/new?clinic=${clinic._id}&clinicName=${encodeURIComponent(clinic.name)}`}
      className="block w-full text-center py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors text-sm mt-2"
    >
      Book Appointment
    </Link>
  </div>
);

const Clinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await api.get('/clinics');
        setClinics(res.data);
      } catch (err) {
        setError('Failed to load clinics. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  const filtered = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      c.specializations?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold text-white mb-2">Vet Clinics in Gurugram</h2>
        <p className="text-slate-400 text-lg">Find & book trusted veterinary care near you</p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by name, area, or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl px-5 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-800/40 rounded-2xl p-6 animate-pulse h-64" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p className="text-5xl mb-4">🏥</p>
          <p className="text-xl font-medium">No clinics found</p>
          <p className="text-sm mt-2">Try a different search term or check back later</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((clinic) => (
            <ClinicCard key={clinic._id} clinic={clinic} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Clinics;
