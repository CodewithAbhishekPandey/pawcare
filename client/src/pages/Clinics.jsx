import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const SPECIALIZATION_ICONS = {
  'General': '🏥', 'Dermatology': '🔬', 'Dentistry': '🦷',
  'Surgery': '⚕️', 'Ophthalmology': '👁️', 'Cardiology': '❤️',
  'Orthopedics': '🦴', 'Nutrition': '🥗',
};

const ClinicCard = ({ clinic }) => (
  <div className="bg-white border border-stone-100 rounded-3xl p-6 hover:border-paw-teal/30 hover:shadow-xl hover:shadow-paw-teal/5 transition-all duration-300 group shadow-sm flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <h3 className="text-xl font-black text-paw-teal group-hover:text-paw-orange transition-colors">{clinic.name}</h3>
      {clinic.isVerified && (
        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full font-bold">
          ✓ Verified
        </span>
      )}
    </div>
    <p className="text-stone-400 text-sm flex items-center gap-2 font-medium">
      <span>📍</span> {clinic.address}
    </p>
    {clinic.timings?.open && (
      <p className="text-stone-400 text-xs flex items-center gap-2 font-medium">
        <span>🕐</span> {clinic.timings.open} – {clinic.timings.close}
      </p>
    )}
    {clinic.specializations?.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {clinic.specializations.map((s) => (
          <span key={s} className="text-xs px-2 py-1 bg-paw-teal/5 border border-paw-teal/20 text-paw-teal rounded-full font-bold">
            {SPECIALIZATION_ICONS[s] || '🐾'} {s}
          </span>
        ))}
      </div>
    )}
    {clinic.availableSlots?.length > 0 && (
      <div>
        <p className="text-xs text-stone-400 mb-2 font-bold uppercase tracking-wide">Available Slots</p>
        <div className="flex flex-wrap gap-2">
          {clinic.availableSlots.slice(0, 4).map((slot, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-stone-50 text-stone-500 rounded-xl border border-stone-200 font-medium">
              {typeof slot === 'string' ? slot : `${slot.day} ${slot.time}`}
            </span>
          ))}
          {clinic.availableSlots.length > 4 && (
            <span className="text-xs px-2 py-1 bg-stone-50 text-stone-400 rounded-xl font-medium">
              +{clinic.availableSlots.length - 4} more
            </span>
          )}
        </div>
      </div>
    )}
    <Link
      to={`/appointments/new?clinic=${clinic._id}&clinicName=${encodeURIComponent(clinic.name)}`}
      className="mt-auto block w-full text-center py-3 bg-paw-teal hover:bg-opacity-90 text-white font-black rounded-2xl transition-all shadow-md shadow-paw-teal/10 text-sm"
    >
      Book Appointment →
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
        setClinics(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch {
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
    <div className="pb-24">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-black text-paw-teal mb-2">Vet Clinics in Gurugram 🏥</h1>
        <p className="text-stone-500 font-medium text-lg">Find & book trusted veterinary care near you</p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by name, area, or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl px-5 py-3 bg-white border border-stone-200 rounded-2xl text-paw-teal placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-paw-teal/10 focus:border-paw-teal transition-all shadow-sm font-medium"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-stone-100 rounded-3xl p-6 animate-pulse h-64" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-stone-400">
          <p className="text-5xl mb-4">🏥</p>
          <p className="text-xl font-bold text-paw-teal">No clinics found</p>
          <p className="text-sm mt-2 font-medium">Try a different search term or check back later</p>
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
