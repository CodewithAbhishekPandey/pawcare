import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import VetCard from '../components/VetCard';

const FILTERS = {
  petType: ['all', 'dogs', 'cats', 'exotic', 'birds'],
  radius: [
    { label: '1 km', value: 1000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
  ],
};

const VetList = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [petType, setPetType] = useState('all');
  const [radius, setRadius] = useState(5000);
  const [openNow, setOpenNow] = useState(false);

  const fetchVets = async (lat, lng, r, type) => {
    setLoading(true);
    try {
      let url = `/vets?lat=${lat}&lng=${lng}&radius=${r}`;
      if (type && type !== 'all') url += `&specialty=${type}`;
      const res = await api.get(url);
      setClinics(res.data.data || []);
    } catch {
      setError('Failed to load clinics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      // Fallback: use Gurugram center
      const lat = 28.4595;
      const lng = 77.0266;
      setUserLat(lat);
      setUserLng(lng);
      fetchVets(lat, lng, radius, petType);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        fetchVets(lat, lng, radius, petType);
      },
      () => {
        // Geolocation denied — use Gurugram center as fallback
        const lat = 28.4595;
        const lng = 77.0266;
        setUserLat(lat);
        setUserLng(lng);
        fetchVets(lat, lng, radius, petType);
      }
    );
  }, []);

  const handleFilterChange = (newType, newRadius) => {
    if (userLat && userLng) fetchVets(userLat, userLng, newRadius, newType);
  };

  const isOpenNow = (clinic) => {
    if (!clinic.timings?.open || !clinic.timings?.close) return true;
    const now = new Date();
    const [oh, om] = clinic.timings.open.split(':').map(Number);
    const [ch, cm] = clinic.timings.close.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins >= oh * 60 + om && nowMins <= ch * 60 + cm;
  };

  const displayed = openNow ? clinics.filter(isOpenNow) : clinics;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2">Find Vets Near You</h1>
        <p className="text-slate-400">Top-rated veterinary clinics in Gurugram, sorted by distance</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
        {/* Pet type */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.petType.map((t) => (
            <button
              key={t}
              onClick={() => {
                setPetType(t);
                handleFilterChange(t, radius);
              }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize transition-all ${
                petType === t
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {t === 'all' ? 'All Pets' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Radius */}
        <select
          value={radius}
          onChange={(e) => {
            const r = parseInt(e.target.value);
            setRadius(r);
            handleFilterChange(petType, r);
          }}
          className="px-3 py-1.5 bg-slate-700 text-slate-300 border border-slate-600 rounded-xl text-sm focus:outline-none"
        >
          {FILTERS.radius.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        {/* Open now toggle */}
        <button
          onClick={() => setOpenNow((o) => !o)}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            openNow ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${openNow ? 'bg-white' : 'bg-slate-500'}`} />
          Open Now
        </button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-slate-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-white font-medium">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && displayed.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏥</p>
          <h2 className="text-2xl font-bold text-white mb-2">No clinics found</h2>
          <p className="text-slate-400 mb-6">Try expanding your radius or changing the pet type filter.</p>
          <button
            onClick={() => { setPetType('all'); setRadius(10000); handleFilterChange('all', 10000); }}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors"
          >
            Show All Clinics
          </button>
        </div>
      )}

      {!loading && !error && displayed.length > 0 && (
        <>
          <p className="text-slate-400 text-sm mb-4">{displayed.length} clinic{displayed.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((clinic) => (
              <VetCard key={clinic._id} clinic={clinic} userLat={userLat} userLng={userLng} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VetList;
