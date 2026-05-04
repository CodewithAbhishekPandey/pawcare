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
  const role = state?.role || 'owner';
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
      scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
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
        if (sessionId) {
          api.patch(`/consult/session/${sessionId}/status`, { status: 'in_call' }).catch(() => {});
        }
      },
      onLeaveRoom: () => { handleLeave(); },
    });

    return () => { try { zp.destroy(); } catch (_) {} };
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
      try { await api.post('/consult/complete', { sessionId, duration: 15 }); } catch (_) {}
      navigate('/dashboard');
    } else {
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

  // Rating screen
  if (showRating) {
    if (ratingSubmitted) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-2xl font-black text-paw-teal mb-2">Thank you!</h2>
          <p className="text-stone-500 font-medium">Your feedback helps us improve PawCare.</p>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto text-center pb-24">
        <div className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm">
          <div className="text-5xl mb-4">⭐</div>
          <h2 className="text-2xl font-black text-paw-teal mb-2">How was the consultation?</h2>
          <p className="text-stone-500 text-sm mb-6 font-medium">Rate your experience with {state?.vetInfo?.name || 'your vet'}</p>

          {/* Star selector */}
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-4xl transition-all duration-150 ${star <= rating ? 'text-amber-400 scale-110' : 'text-stone-200 hover:text-amber-300'}`}
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
            className="w-full bg-stone-50 border border-stone-200 text-paw-teal placeholder-stone-400 rounded-2xl px-4 py-3 focus:outline-none focus:border-paw-teal resize-none mb-4 text-sm font-medium transition-all"
          />

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/instant-consult')}
              className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl transition-colors text-sm"
            >
              Skip
            </button>
            <button
              id="submit-rating-btn"
              onClick={submitRating}
              className="flex-1 py-3 bg-paw-teal hover:bg-opacity-90 text-white font-black rounded-2xl transition-colors text-sm"
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
        <h2 className="text-xl font-black text-paw-teal mb-3">Video Not Configured</h2>
        <p className="text-stone-500 text-sm mb-6 font-medium">{error}</p>
        <div className="bg-white border border-stone-100 rounded-3xl p-5 text-left w-full mb-6 shadow-sm">
          <p className="text-paw-teal text-sm font-bold mb-2">To enable video calls:</p>
          <ol className="text-stone-500 text-sm space-y-1 list-decimal list-inside font-medium">
            <li>Sign up at <a href="https://zegocloud.com" target="_blank" rel="noreferrer" className="text-paw-orange underline">zegocloud.com</a> (free tier available)</li>
            <li>Create a project and copy your App ID</li>
            <li>Add <code className="bg-stone-100 px-1 rounded text-xs">VITE_ZEGO_APP_ID</code> to <code className="bg-stone-100 px-1 rounded text-xs">client/.env</code></li>
            <li>Restart the dev server</li>
          </ol>
        </div>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-full transition-all shadow-md">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-stone-950 z-40 flex flex-col -mx-4 sm:-mx-6 lg:-mx-8" style={{ top: '64px' }}>
      {/* Room header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-stone-900/90 border-b border-stone-700/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-paw-orange animate-pulse" />
          <span className="text-white font-bold text-sm">Live Consultation</span>
          {petName && <span className="text-stone-400 text-xs">· {petName}</span>}
        </div>
        <button
          id="leave-call-btn"
          onClick={handleLeave}
          className="px-4 py-1.5 bg-red-500/90 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5"
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
