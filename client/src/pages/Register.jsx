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
        <p className="text-xl font-bold text-paw-teal">You're already logged in, {user.name}!</p>
        <Link to="/dashboard" className="mt-6 inline-block px-6 py-3 bg-paw-teal text-white rounded-full font-bold shadow-md">Go to Dashboard</Link>
      </div>
    );
  }

  const inputCls = "block w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-paw-teal placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-paw-teal/20 focus:border-paw-teal transition-all font-medium";
  const labelCls = "block text-sm font-bold text-stone-700 mb-2 ml-1";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-stone-100 p-8 sm:p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-paw-yellow/30 mb-6">
            <span className="text-4xl">🐾</span>
          </div>
          <h1 className="text-3xl font-black text-paw-teal">Create Account</h1>
          <p className="text-stone-500 font-medium mt-2">Join PawCare — Gurugram's premier pet platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-center gap-2 font-medium">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Full Name</label>
            <input name="name" type="text" required value={form.name} onChange={handleChange}
              placeholder="Rahul Sharma" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange}
              placeholder="rahul@example.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone (optional)</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange}
              placeholder="+91 98765 43210" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>I am a...</label>
            <select name="role" value={form.role} onChange={handleChange} className={inputCls}>
              <option value="pet_owner">Pet Owner</option>
              <option value="vet">Veterinarian / Clinic Owner</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <input name="password" type="password" required value={form.password} onChange={handleChange}
              placeholder="Min. 6 characters" className={inputCls} />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full mt-2 py-4 px-4 bg-paw-teal hover:bg-opacity-90 disabled:opacity-60 font-black text-lg rounded-2xl shadow-xl shadow-paw-teal/20 transition-all transform hover:-translate-y-1 active:scale-95 text-white"
          >
            {loading ? 'Creating account…' : 'Create Account 🐾'}
          </button>
        </form>

        <p className="text-center text-stone-500 font-medium mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-paw-teal hover:text-paw-orange font-bold underline decoration-2 underline-offset-4 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
