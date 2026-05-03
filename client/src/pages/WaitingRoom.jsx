import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import WaitingSpinner from '../components/WaitingSpinner';
import api from '../api/axios';

const WaitingRoom = () => {
  const { sessionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState('waiting');
  const [matchedVet, setMatchedVet] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const timerRef = useRef(null);

  const vet = state?.vet;
  const petName = state?.petName;
  const petType = state?.petType;
  const issue = state?.issue;

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Join waiting room via socket
  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('join_waiting_room', {
      sessionId,
      ownerInfo: {
        ownerId: user._id || user.id,
        ownerName: user.name,
        petName,
        petType,
        issue,
      },
    });

    const onMatchFound = ({ meetRoomId, vetInfo }) => {
      clearInterval(timerRef.current);
      setMatchedVet(vetInfo);
      setStatus('matched');

      // Update session status in DB
      api.patch('/consult/session/' + sessionId + '/status', { status: 'in_call' }).catch(() => {});

      // Navigate to video room after a short celebration delay
      setTimeout(() => {
        navigate(`/video/${meetRoomId}`, {
          state: { sessionId, vetInfo, petName, petType, role: 'owner' },
        });
      }, 2000);
    };

    socket.on('match_found', onMatchFound);

    return () => {
      socket.off('match_found', onMatchFound);
    };
  }, [socket, sessionId, user, navigate, petName, petType, issue]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this consultation? Refunds may take 3-5 business days.')) return;
    setCancelling(true);
    try {
      socket?.emit('cancel_waiting', { sessionId });
      await api.patch(`/consult/session/${sessionId}/cancel`);
      navigate('/instant-consult');
    } catch {
      setCancelling(false);
    }
  };

  if (status === 'matched') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-7xl mb-6 animate-bounce">🎉</div>
        <h2 className="text-3xl font-extrabold text-white mb-2">Vet Found!</h2>
        <p className="text-emerald-400 font-semibold text-lg mb-1">
          {matchedVet?.name || 'Your vet'} is ready
        </p>
        <p className="text-slate-400 mb-4">Starting video call in a moment...</p>
        <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto text-center">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Looking for your vet...</h1>
        <p className="text-slate-400">
          We're matching you with the best available vet. This usually takes under 2 minutes.
        </p>
      </div>

      {/* Spinner */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 mb-6">
        <WaitingSpinner
          message="Finding your vet..."
          elapsed={elapsed}
        />
      </div>

      {/* Session info */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 mb-6 text-left space-y-3">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider text-center mb-4">Consultation Details</h3>
        {vet && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Requested vet</span>
            <span className="text-white font-medium">{vet.name}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Pet</span>
          <span className="text-white font-medium">{petName} ({petType})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Issue</span>
          <span className="text-white font-medium text-right max-w-[60%] text-sm">{issue}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Status</span>
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Waiting in queue
          </span>
        </div>
        {vet?.consultFee && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
            <span className="text-slate-400 text-sm">Paid</span>
            <span className="text-emerald-400 font-bold">₹{vet.consultFee} ✓</span>
          </div>
        )}
      </div>

      {/* Tips while waiting */}
      <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 mb-6 text-left">
        <p className="text-sky-400 font-semibold text-sm mb-2">💡 While you wait</p>
        <ul className="text-slate-400 text-sm space-y-1">
          <li>• Keep your pet calm and in good lighting</li>
          <li>• Test your camera and microphone</li>
          <li>• Have your pet's medical records handy if available</li>
        </ul>
      </div>

      {/* Cancel */}
      <button
        id="cancel-waiting-btn"
        onClick={handleCancel}
        disabled={cancelling}
        className="text-slate-500 hover:text-rose-400 text-sm transition-colors disabled:opacity-50 underline underline-offset-2"
      >
        {cancelling ? 'Cancelling...' : 'Cancel and request refund'}
      </button>
    </div>
  );
};

export default WaitingRoom;
