import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🏥', title: 'Verified Clinics', desc: 'Browse 50+ trusted vet clinics across Gurugram — DLF, Sohna Road, Cyber City & more.' },
  { icon: '📅', title: 'Instant Booking', desc: 'Book appointments in seconds. Get confirmed slots and reminders for your pet visits.' },
  { icon: '🛒', title: 'Premium Pet Shop', desc: 'Shop top brands for food, medicine, accessories & toys delivered to your doorstep.' },
  { icon: '🐾', title: 'Pet Profiles', desc: 'Keep track of your pet\'s health history, medications, and upcoming appointments.' },
];

const STATS = [
  { value: '50+', label: 'Verified Clinics' },
  { value: '500+', label: 'Pet Owners' },
  { value: '1200+', label: 'Appointments' },
  { value: '4.8★', label: 'Avg. Rating' },
];

const Home = ({ settings = {} }) => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-20 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/15 border border-rose-500/25 rounded-full text-rose-300 text-sm font-medium mb-6">
          🐾 Gurugram's #1 Pet Care Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
          {settings.homepage_banner_text ? (
            <span dangerouslySetInnerHTML={{ __html: settings.homepage_banner_text.replace('\n', '<br/>') }} />
          ) : (
            <>Premium Pet Care,<br />Delivered Daily.</>
          )}
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          {settings.homepage_banner_subtext || "Your pets deserve the best. Book vetted clinics, track appointments, and shop premium products — all from Gurugram's most trusted pet platform."}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/vets"
            className="px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-rose-500/25 transition-all transform hover:scale-105"
          >
            Find a Vet Clinic →
          </Link>
          <Link
            to="/shop"
            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg rounded-2xl border border-slate-600 transition-all transform hover:scale-105"
          >
            🛒 Browse Shop
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {STATS.map((s) => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center">
            <p className="text-3xl font-black text-white mb-1">{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="mb-20">
        <h2 className="text-3xl font-extrabold text-white text-center mb-3">Everything Your Pet Needs</h2>
        <p className="text-slate-400 text-center mb-12">One platform for all your pet care needs in Gurugram</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-rose-500/30 transition-all group">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="text-center bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 rounded-3xl p-16 mb-10">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to get started?</h2>
          <p className="text-slate-400 text-lg mb-8">Join thousands of pet owners across Gurugram</p>
          <Link
            to="/register"
            className="px-10 py-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-lg rounded-2xl shadow-xl transition-all transform hover:scale-105 inline-block"
          >
            Create Free Account
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home;
