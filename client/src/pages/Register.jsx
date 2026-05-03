import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'pet_owner', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="text-center mt-20">
        <p className="text-5xl mb-4">🐾</p>
        <p className="text-xl font-medium text-white">You're already logged in, {user.name}!</p>
        <Link to="/dashboard" className="mt-6 inline-block px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-slate-700/50">
      <div className="text-center mb-8">
        <span className="text-4xl">🐾</span>
        <h1 className="text-3xl font-extrabold text-white mt-2">Create Account</h1>
        <p className="text-slate-400 text-sm mt-1">Join PawCare — Gurugram's premier pet platform</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
          <input
            name="name" type="text" required value={form.name} onChange={handleChange}
            placeholder="Rahul Sharma"
            className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
          <input
            name="email" type="email" required value={form.email} onChange={handleChange}
            placeholder="rahul@example.com"
            className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Phone (optional)</label>
          <input
            name="phone" type="tel" value={form.phone} onChange={handleChange}
            placeholder="+91 98765 43210"
            className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">I am a...</label>
          <select
            name="role" value={form.role} onChange={handleChange}
            className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          >
            <option value="pet_owner">Pet Owner</option>
            <option value="vet">Veterinarian / Clinic Owner</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input
            name="password" type="password" required value={form.password} onChange={handleChange}
            placeholder="Min. 6 characters"
            className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-60 font-bold text-lg rounded-xl shadow-lg transition-all transform active:scale-95 text-white"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-slate-400 text-sm mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-rose-400 hover:text-rose-300 font-semibold">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
