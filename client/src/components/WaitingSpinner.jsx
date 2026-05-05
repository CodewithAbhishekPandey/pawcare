import React, { memo } from 'react';

const WaitingSpinner = ({ message = 'Finding you a vet...', elapsed = 0 }) => {
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center py-10 select-none">
      {/* Animated ring */}
      <div className="relative w-32 h-32 mb-8">
        {/* Soft glow */}
        <div className="absolute inset-0 rounded-full bg-paw-teal/10 blur-xl animate-pulse" />

        {/* Spinning conic ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #0f4c5c, #fbbf24, #0f4c5c)',
            WebkitMask: 'radial-gradient(circle at center, transparent 44px, black 46px)',
            mask: 'radial-gradient(circle at center, transparent 44px, black 46px)',
            animation: 'spin 1.5s linear infinite',
          }}
        />

        {/* Center paw */}
        <div
          className="absolute inset-0 flex items-center justify-center text-4xl"
          style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
        >
          🐾
        </div>

        {/* Orbiting dots */}
        {[0, 90, 180, 270].map((deg, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-paw-teal"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '-48px 0',
              transform: `translateY(-50%) rotate(${deg}deg)`,
              animation: `spin 1.5s linear infinite`,
              animationDelay: `${i * 0.15}s`,
              opacity: 0.4 + i * 0.15,
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <h2 className="text-xl font-black text-paw-teal mb-2 text-center">{message}</h2>
      <p className="text-stone-400 text-sm mb-6 font-medium text-center">Our vets are notified and standing by</p>

      {/* Timer */}
      <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-full px-5 py-2.5 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-paw-orange animate-pulse" />
        <span className="text-paw-teal text-sm font-mono font-bold">
          {mins}:{secs}
        </span>
        <span className="text-stone-400 text-sm font-medium">elapsed</span>
      </div>

      {/* Paw trail */}
      <div className="flex gap-3 mt-8">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="text-2xl"
            style={{
              animation: `bounce 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.3 + i * 0.18,
            }}
          >
            🐾
          </span>
        ))}
      </div>
    </div>
  );
};

export default memo(WaitingSpinner);
