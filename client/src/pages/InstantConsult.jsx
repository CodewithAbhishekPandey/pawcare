import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ConsultCard from '../components/ConsultCard';
import PaymentModal from '../components/PaymentModal';

const InstantConsult = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVet, setSelectedVet] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch available vets from REST
  const fetchVets = useCallback(async () => {
    setFetching(true);
    try {
      const { data } = await api.get('/consult/available-vets');
      setVets(data.data || []);
    } catch (err) {
      console.error('Failed to fetch vets:', err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchVets();
  }, [fetchVets]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const onVetOnline = (vetData) => {
      setVets((prev) => {
        // Avoid duplicates
        if (prev.some((v) => v._id === vetData.vetId)) return prev;
        return [...prev, {
          _id: vetData.vetId,
          name: vetData.name,
          consultFee: vetData.consultFee,
          specializations: vetData.specializations || [],
          rating: vetData.rating || 0,
          totalRatings: vetData.totalRatings || 0,
          isOnline: true,
        }];
      });
    };

    const onVetOffline = ({ vetId }) => {
      setVets((prev) => prev.filter((v) => v._id !== vetId));
    };

    socket.on('vet_came_online', onVetOnline);
    socket.on('vet_went_offline', onVetOffline);

    return () => {
      socket.off('vet_came_online', onVetOnline);
      socket.off('vet_went_offline', onVetOffline);
    };
  }, [socket]);

  const handleConsultNow = (vet) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedVet(vet);
    setShowPayment(true);
  };

  const handlePaymentSuccess = ({ sessionId, vet, petName, petType, issue }) => {
    setShowPayment(false);
    navigate(`/waiting-room/${sessionId}`, {
      state: { vet, petName, petType, issue },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-sm font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          Live · Updated in real-time
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">
          Instant Vet Consult 📹
        </h1>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          Connect with a licensed vet via video call in minutes — no appointment needed.
          Pay once, get expert advice instantly.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { icon: '🔍', step: '1', label: 'Pick a vet', sub: 'See who\'s available now' },
          { icon: '💳', step: '2', label: 'Pay securely', sub: 'One-time consult fee' },
          { icon: '📹', step: '3', label: 'Start video call', sub: 'Matched instantly' },
        ].map(({ icon, step, label, sub }) => (
          <div key={step} className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-white font-semibold text-sm">{label}</p>
            <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Refresh + count row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white font-bold text-xl">
            Available Vets
            {vets.length > 0 && (
              <span className="ml-2.5 px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-full text-sm font-semibold">
                {vets.length} online
              </span>
            )}
          </h2>
        </div>
        <button
          id="refresh-vets-btn"
          onClick={fetchVets}
          disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        >
          <span className={fetching ? 'animate-spin inline-block' : 'inline-block'}>↻</span>
          Refresh
        </button>
      </div>

      {/* Vet cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : vets.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 border border-slate-700/40 rounded-3xl">
          <p className="text-5xl mb-4">😔</p>
          <h3 className="text-white font-bold text-xl mb-2">No vets available right now</h3>
          <p className="text-slate-400 mb-6">Our vets might be in a call or taking a break. Check back in a few minutes.</p>
          <button
            onClick={fetchVets}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {vets.map((vet) => (
            <ConsultCard key={vet._id} vet={vet} onConsult={handleConsultNow} />
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && selectedVet && (
        <PaymentModal
          vet={selectedVet}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default InstantConsult;
