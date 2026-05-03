import React, { memo } from 'react';

const WaitingSpinner = ({ message = 'Finding you a vet...', elapsed = 0 }) => {
  const paws = ['🐾', '🐾', '🐾', '🐾'];

  return (
    <div className="flex flex-col items-center justify-center py-12 select-none">
      {/* Animated paw orbit ring */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500/30 to-amber-500/30 blur-xl animate-pulse" />

        {/* Rotating ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            background: 'conic-gradient(from 0deg, #f43f5e, #fb923c, #f43f5e)',
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
            className="absolute w-3 h-3 rounded-full bg-rose-400"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '-48px 0',
              transform: `translateY(-50%) rotate(${deg}deg)`,
              animation: `spin 1.5s linear infinite`,
              animationDelay: `${i * 0.15}s`,
              opacity: 0.7 + i * 0.075,
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <h2 className="text-xl font-bold text-white mb-2">{message}</h2>
      <p className="text-slate-400 text-sm mb-6">Our vets are notified and standing by</p>

      {/* Elapsed time */}
      <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-5 py-2.5">
        <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
        <span className="text-slate-300 text-sm font-mono">
          {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
        </span>
        <span className="text-slate-500 text-sm">elapsed</span>
      </div>

      {/* Paw trail animation */}
      <div className="flex gap-3 mt-8">
        {paws.map((paw, i) => (
          <span
            key={i}
            className="text-2xl"
            style={{
              animation: `bounce 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.4 + i * 0.15,
            }}
          >
            {paw}
          </span>
        ))}
      </div>
    </div>
  );
};

export default memo(WaitingSpinner);
