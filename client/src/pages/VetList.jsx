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
    const fallbackLat = 28.4595;
    const fallbackLng = 77.0266;
    if (!navigator.geolocation) {
      setUserLat(fallbackLat);
      setUserLng(fallbackLng);
      fetchVets(fallbackLat, fallbackLng, radius, petType);
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
        setUserLat(fallbackLat);
        setUserLng(fallbackLng);
        fetchVets(fallbackLat, fallbackLng, radius, petType);
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
    <div className="bg-paw-cream min-h-screen pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-black text-paw-teal mb-2">Find Vets Near You 🐾</h1>
        <p className="text-stone-500 font-medium">Top-rated veterinary clinics in Gurugram, sorted by distance</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 p-4 bg-white border border-stone-100 rounded-3xl shadow-sm">
        {/* Pet type */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.petType.map((t) => (
            <button
              key={t}
              onClick={() => {
                setPetType(t);
                handleFilterChange(t, radius);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-bold capitalize transition-all border ${
                petType === t
                  ? 'bg-paw-teal text-white border-paw-teal'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-paw-teal hover:text-paw-teal'
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
          className="px-3 py-1.5 bg-white text-stone-600 border border-stone-200 rounded-full text-sm font-medium focus:outline-none focus:border-paw-teal transition-colors"
        >
          {FILTERS.radius.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        {/* Open now toggle */}
        <button
          onClick={() => setOpenNow((o) => !o)}
          className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border ${
            openNow
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${openNow ? 'bg-white' : 'bg-stone-300'}`} />
          Open Now
        </button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-stone-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-paw-teal font-bold">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && displayed.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏥</p>
          <h2 className="text-2xl font-bold text-paw-teal mb-2">No clinics found</h2>
          <p className="text-stone-500 mb-6">Try expanding your radius or changing the pet type filter.</p>
          <button
            onClick={() => { setPetType('all'); setRadius(10000); handleFilterChange('all', 10000); }}
            className="px-6 py-3 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-full transition-all shadow-md"
          >
            Show All Clinics
          </button>
        </div>
      )}

      {!loading && !error && displayed.length > 0 && (
        <>
          <p className="text-stone-400 text-sm mb-4 font-medium">{displayed.length} clinic{displayed.length !== 1 ? 's' : ''} found nearby</p>
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
