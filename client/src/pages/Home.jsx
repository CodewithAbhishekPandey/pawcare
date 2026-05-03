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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/25 rounded-full text-rose-600 dark:text-rose-300 text-sm font-bold mb-6 shadow-sm">
          🐾 Gurugram's #1 Pet Care Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-800 dark:text-white mb-6 leading-tight drop-shadow-sm">
          {settings.homepage_banner_text ? (
            <span dangerouslySetInnerHTML={{ __html: settings.homepage_banner_text.replace('\n', '<br/>') }} />
          ) : (
            <>Premium Pet Care,<br />Delivered Daily.</>
          )}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
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
            className="px-8 py-4 bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-lg rounded-2xl border border-slate-200 dark:border-slate-600 shadow-sm transition-all transform hover:scale-105"
          >
            🛒 Browse Shop
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 text-center shadow-lg shadow-slate-200/50 dark:shadow-none backdrop-blur-xl transition-all duration-300 hover:-translate-y-1">
            <p className="text-3xl font-black bg-gradient-to-br from-rose-500 to-orange-500 bg-clip-text text-transparent mb-1">{s.value}</p>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="mb-20">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white text-center mb-3">Everything Your Pet Needs</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-12 font-medium">One platform for all your pet care needs in Gurugram</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-rose-400 dark:hover:border-rose-500/30 transition-all duration-300 group hover:-translate-y-1 backdrop-blur-sm">
              <div className="text-4xl mb-5 inline-block p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{f.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="text-center bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-500/10 dark:to-orange-500/10 border border-rose-200 dark:border-rose-500/20 rounded-[2.5rem] p-16 mb-10 shadow-2xl shadow-rose-500/10 dark:shadow-none">
          <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4">Ready to get started?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 font-medium">Join thousands of pet owners across Gurugram</p>
          <Link
            to="/register"
            className="px-10 py-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-rose-500/20 transition-all transform hover:-translate-y-1 inline-block"
          >
            Create Free Account
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home;
