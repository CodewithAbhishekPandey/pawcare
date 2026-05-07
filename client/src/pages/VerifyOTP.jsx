import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email, name } = location.state || {};

  // Redirect if navigated here directly without registration state
  useEffect(() => {
    if (!userId) {
      navigate('/register', { replace: true });
    }
  }, [userId, navigate]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resendActive, setResendActive] = useState(false);
  const [toast, setToast] = useState('');

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Auto-focus first box on mount
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  // Countdown timer for Resend button
  useEffect(() => {
    if (countdown <= 0) {
      setResendActive(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Handle value change in OTP fields
  const handleChange = (index, value) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next box if filled
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs[index - 1].current.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Handle pasting 6 digits
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      inputRefs[5].current.focus();
    }
  };

  // Resend OTP API call
  const handleResend = async () => {
    if (!resendActive) return;
    setError('');
    setToast('');
    try {
      const res = await api.post('/auth/resend-otp', { userId });
      if (res.data.success) {
        setToast('New code sent to your email!');
        setCountdown(60);
        setResendActive(false);
        setOtp(['', '', '', '', '', '']);
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
        setTimeout(() => setToast(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code.');
    }
  };

  // Verify OTP API call
  const handleVerify = async (e) => {
    e.preventDefault();
    const combinedOtp = otp.join('');
    if (combinedOtp.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', { userId, otp: combinedOtp });
      if (res.data.success) {
        const { token, user } = res.data.data;
        setSuccess('Email verified! Welcome to Pawvetra 🐾');
        
        // Save token and user to localStorage
        localStorage.setItem('pawcare_token', token);
        localStorage.setItem('pawcare_user', JSON.stringify(user));

        // After 1.5s, redirect to dashboard with a clean window redirect to let AuthContext capture credentials
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      if (inputRefs[0].current) {
        inputRefs[0].current.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.every((val) => val !== '');

  if (!userId) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F0F9F4] px-4 py-10 rounded-[2rem] border border-stone-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-50 p-8 sm:p-10 relative overflow-hidden">
        
        {/* Background Accent Decorative Ring */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full translate-x-10 -translate-y-10 -z-10"></div>

        {/* Top Icon & Titles */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-4 animate-bounce">
            <span className="text-5xl">📧</span>
          </div>
          <h1 className="text-3xl font-black text-[#1A3A2A]">Check your email</h1>
          <p className="text-stone-500 font-medium mt-2">We've sent a 6-digit code to:</p>
          <p className="text-base font-bold text-[#2D6A4F] mt-1 break-all bg-green-50/50 py-1.5 px-4 rounded-full inline-block">{email}</p>
          <p className="text-stone-400 text-xs font-semibold mt-3">Enter the code below to verify your account.</p>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
            <span>✨</span> {toast}
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold text-center flex items-center justify-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Success Notification */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-[#2D6A4F] rounded-2xl text-sm font-bold text-center flex items-center justify-center gap-2">
            <span>🐾</span> {success}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-between gap-2 max-w-sm mx-auto" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 sm:w-14 sm:h-16 border-2 rounded-2xl text-center text-3xl font-black focus:outline-none transition-all ${
                  digit 
                    ? 'border-[#2D6A4F] bg-green-50/20 text-[#1A3A2A]' 
                    : 'border-stone-200 focus:border-[#2D6A4F] focus:ring-2 focus:ring-green-50'
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isOtpComplete || loading}
            className="w-full py-4 bg-[#2D6A4F] hover:bg-[#1f4b36] disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Email ✅'
            )}
          </button>
        </form>

        {/* Resend Actions */}
        <div className="text-center mt-8 space-y-4">
          <div className="text-sm font-semibold text-stone-500">
            Didn't receive the code?{' '}
            {resendActive ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#2D6A4F] hover:underline font-black focus:outline-none"
              >
                Resend OTP
              </button>
            ) : (
              <span className="text-stone-400">
                Resend OTP in 0:{countdown.toString().padStart(2, '0')}
              </span>
            )}
          </div>

          {/* Go Back Option */}
          <div className="pt-4 border-t border-stone-100">
            <Link
              to="/register"
              className="text-stone-400 hover:text-stone-600 text-xs font-bold transition-colors"
            >
              Wrong email? Go back
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;
