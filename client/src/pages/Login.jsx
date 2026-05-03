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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/60 dark:bg-slate-800/50 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white/50 dark:border-slate-700/50 transition-all duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-100 to-orange-100 dark:from-rose-500/20 dark:to-orange-500/20 mb-6 shadow-inner">
            <span className="text-4xl drop-shadow-sm">🐾</span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-br from-slate-800 to-slate-500 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Sign in to your PawCare account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2 font-medium">
             <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="block w-full px-5 py-4 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full px-5 py-4 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300"
              required
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 px-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-60 disabled:hover:scale-100 font-black text-lg rounded-2xl shadow-xl shadow-rose-500/30 dark:shadow-rose-900/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-white flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-pulse">Authenticating...</span> : 'Sign In 🚀'}
          </button>
        </form>

        <div className="mt-8 p-5 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-bold uppercase tracking-wider">Demo Access</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
               <span className="text-slate-500 dark:text-slate-400 font-medium">Pet Owner:</span>
               <span className="font-bold text-slate-700 dark:text-slate-200">riya@pawcare.in</span>
            </div>
            <div className="flex justify-between text-sm">
               <span className="text-slate-500 dark:text-slate-400 font-medium">Veterinarian:</span>
               <span className="font-bold text-slate-700 dark:text-slate-200">drpriya@pawcare.in</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
               <span className="text-slate-500 dark:text-slate-400 font-medium">Password:</span>
               <span className="font-bold text-slate-700 dark:text-slate-200">Password123!</span>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 dark:text-slate-400 font-medium mt-8">
          New to PawCare?{' '}
          <Link to="/register" className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-bold underline decoration-2 underline-offset-4 transition-colors">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
