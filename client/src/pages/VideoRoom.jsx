import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';

const VideoRoom = () => {
  const { roomId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const containerRef = useRef(null);
  const [error, setError] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const sessionId = state?.sessionId;
  const role = state?.role || 'owner'; // 'owner' | 'vet'
  const petName = state?.petName;

  useEffect(() => {
    if (!containerRef.current || !user || !roomId) return;

    const userId = user._id || user.id || String(Date.now());
    const userName = user.name || 'PawCare User';

    const appId = parseInt(import.meta.env.VITE_ZEGO_APP_ID || '0');

    if (!appId) {
      setError('Video service not configured. Please add VITE_ZEGO_APP_ID to your .env file.');
      return;
    }

    // Generate Zegocloud Kit Token
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      import.meta.env.VITE_ZEGO_SERVER_SECRET || '',
      roomId,
      userId,
      userName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: containerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: false,
      showTextChat: true,
      showUserList: false,
      maxUsers: 2,
      layout: 'Auto',
      showLayoutButton: false,
      onJoinRoom: () => {
        console.log('Joined video room:', roomId);
        if (sessionId) {
          api.patch(`/consult/session/${sessionId}/status`, { status: 'in_call' }).catch(() => {});
        }
      },
      onLeaveRoom: () => {
        handleLeave();
      },
    });

    return () => {
      try { zp.destroy(); } catch (_) {}
    };
  }, [roomId, user]);

  const handleLeave = async () => {
    setCallEnded(true);

    if (socket && sessionId) {
      socket.emit('call_ended', {
        sessionId,
        vetId: role === 'vet' ? (user._id || user.id) : undefined,
      });
    }

    if (role === 'vet' && sessionId) {
      try {
        await api.post('/consult/complete', { sessionId, duration: 15 });
      } catch (_) {}
      navigate('/dashboard');
    } else {
      // Show rating modal for owner
      setShowRating(true);
    }
  };

  const submitRating = async () => {
    try {
      await api.post('/consult/rate', { sessionId, rating, review });
      setRatingSubmitted(true);
      setTimeout(() => navigate('/instant-consult'), 2000);
    } catch {
      navigate('/instant-consult');
    }
  };

  // Rating screen after call
  if (showRating) {
    if (ratingSubmitted) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank you!</h2>
          <p className="text-slate-400">Your feedback helps us improve PawCare.</p>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8">
          <div className="text-5xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold text-white mb-2">How was the consultation?</h2>
          <p className="text-slate-400 text-sm mb-6">Rate your experience with {state?.vetInfo?.name || 'your vet'}</p>

          {/* Star selector */}
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-4xl transition-all duration-150 ${star <= rating ? 'text-amber-400 scale-110' : 'text-slate-600 hover:text-amber-300'}`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience (optional)"
            rows={3}
            className="w-full bg-slate-700/60 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500/70 resize-none mb-4 text-sm"
          />

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/instant-consult')}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition-colors text-sm"
            >
              Skip
            </button>
            <button
              id="submit-rating-btn"
              onClick={submitRating}
              className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors text-sm"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="text-5xl mb-4">📹</div>
        <h2 className="text-xl font-bold text-white mb-3">Video Not Configured</h2>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-left w-full mb-6">
          <p className="text-slate-300 text-sm font-semibold mb-2">To enable video calls:</p>
          <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
            <li>Sign up at <a href="https://zegocloud.com" target="_blank" rel="noreferrer" className="text-rose-400 underline">zegocloud.com</a> (free tier available)</li>
            <li>Create a project and copy your App ID</li>
            <li>Add <code className="bg-slate-700 px-1 rounded text-xs">VITE_ZEGO_APP_ID</code> to <code className="bg-slate-700 px-1 rounded text-xs">client/.env</code></li>
            <li>Restart the dev server</li>
          </ol>
        </div>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-40 flex flex-col -mx-4 sm:-mx-6 lg:-mx-8" style={{ top: '64px' }}>
      {/* Room header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-700/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-white font-semibold text-sm">Live Consultation</span>
          {petName && <span className="text-slate-400 text-xs">· {petName}</span>}
        </div>
        <button
          id="leave-call-btn"
          onClick={handleLeave}
          className="px-4 py-1.5 bg-red-500/90 hover:bg-red-500 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
        >
          📴 End Call
        </button>
      </div>

      {/* Video container */}
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
};

export default VideoRoom;
