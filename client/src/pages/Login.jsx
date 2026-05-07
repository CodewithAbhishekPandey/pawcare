import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="text-center mt-20">
        <p className="text-5xl mb-4">👋</p>
        <p className="text-xl font-bold text-paw-teal">Welcome back, {user.name}!</p>
        <Link to="/dashboard" className="mt-6 inline-block px-6 py-3 bg-paw-teal text-white rounded-full font-bold shadow-md">Go to Dashboard</Link>
      </div>
    );
  }

  const inputCls = "block w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-paw-teal placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-paw-teal/10 focus:border-paw-teal transition-all duration-300 font-medium";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-stone-100 p-8 sm:p-10 transition-all duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-paw-yellow/30 mb-6 shadow-inner">
            <span className="text-4xl drop-shadow-sm">🐾</span>
          </div>
          <h1 className="text-3xl font-black text-paw-teal">Welcome Back</h1>
          <p className="text-stone-500 font-medium mt-2">Sign in to your Pawvetra account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center gap-2 font-medium">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2 ml-1">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2 ml-1">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
              required
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 px-4 bg-paw-teal hover:bg-opacity-90 disabled:opacity-60 font-black text-lg rounded-2xl shadow-xl shadow-paw-teal/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-white flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-pulse">Authenticating...</span> : 'Sign In 🚀'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 p-5 bg-stone-50 rounded-2xl border border-stone-100">
          <p className="text-xs text-stone-400 mb-3 font-black uppercase tracking-wider">Demo Access</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 font-medium">Pet Owner:</span>
              <span className="font-bold text-paw-teal">riya@pawcare.in</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500 font-medium">Veterinarian:</span>
              <span className="font-bold text-paw-teal">drpriya@pawcare.in</span>
            </div>
            <div className="flex justify-between text-sm border-t border-stone-200 pt-3 mt-3">
              <span className="text-stone-500 font-medium">Password:</span>
              <span className="font-bold text-paw-teal">Password123!</span>
            </div>
          </div>
        </div>

        <p className="text-center text-stone-500 font-medium mt-8">
          New to Pawvetra?{' '}
          <Link to="/register" className="text-paw-teal hover:text-paw-orange font-bold underline decoration-2 underline-offset-4 transition-colors">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
