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
        <p className="text-xl font-medium text-white">Welcome back, {user.name}!</p>
        <Link to="/dashboard" className="mt-6 inline-block px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-slate-700/50">
      <div className="text-center mb-8">
        <span className="text-4xl">🐾</span>
        <h1 className="text-3xl font-extrabold text-white mt-2">Welcome Back</h1>
        <p className="text-slate-400 text-sm mt-1">Sign in to your PawCare account</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            required
          />
        </div>
        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-60 font-bold text-lg rounded-xl shadow-lg transition-all transform active:scale-95 text-white"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-slate-800/80 rounded-xl border border-slate-700/50">
        <p className="text-xs text-slate-500 mb-2 font-medium">Demo credentials:</p>
        <p className="text-xs text-slate-400">Pet Owner: <span className="text-slate-300">riya@pawcare.in</span></p>
        <p className="text-xs text-slate-400">Vet: <span className="text-slate-300">drpriya@pawcare.in</span></p>
        <p className="text-xs text-slate-400">Password: <span className="text-slate-300">Password123!</span></p>
      </div>

      <p className="text-center text-slate-400 text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-rose-400 hover:text-rose-300 font-semibold">Create one free</Link>
      </p>
    </div>
  );
};

export default Login;
