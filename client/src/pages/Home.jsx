import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 1, label: 'Grooming', icon: '🧼', bg: 'bg-amber-100 dark:bg-amber-900/30', link: '/shop?category=accessory' },
  { id: 2, label: 'Veterinary', icon: '🏥', bg: 'bg-rose-100 dark:bg-rose-900/30', link: '/vets' },
  { id: 3, label: 'Foods', icon: '🍖', bg: 'bg-emerald-100 dark:bg-emerald-900/30', link: '/shop?category=food' },
  { id: 4, label: 'More', icon: '•••', bg: 'bg-stone-100 dark:bg-slate-800', link: '#' },
];

const SHOP_FILTERS = [
  { id: 'dogs', label: 'Dog', img: '/assets/dog.png', bg: 'bg-amber-100 dark:bg-amber-900/40', link: '/vets?specialty=dogs' },
  { id: 'cats', label: 'Cat', img: '/assets/cat.png', bg: 'bg-blue-100 dark:bg-blue-900/40', link: '/vets?specialty=cats' },
  { id: 'exotic', label: 'Rodent', img: '/assets/rodent.png', bg: 'bg-rose-100 dark:bg-rose-900/40', link: '/vets?specialty=exotic' },
];

const RECOMMENDATIONS = [
  { 
    id: 1, 
    tag: 'Health', 
    title: 'The best locations for active walks', 
    img: '🌲', 
    bg: 'bg-paw-yellow', 
    textColor: 'text-paw-teal' 
  },
  { 
    id: 2, 
    tag: 'Education', 
    title: 'Five Simple Commands for...', 
    img: '🐶', 
    bg: 'bg-paw-orange', 
    textColor: 'text-white' 
  },
];

const Home = ({ settings = {} }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-paw-cream dark:bg-paw-dark min-h-screen pb-32 font-sans text-paw-teal dark:text-slate-200">
      
      {/* 1. Hero / Branding Section - Pixar Style */}
      <section className="px-4 mb-8">
        <div className="bg-white dark:bg-paw-dark-card rounded-5xl overflow-hidden shadow-2xl shadow-paw-teal/5 dark:shadow-none border border-stone-100 dark:border-slate-800">
          <div className="relative aspect-[4/5] bg-paw-yellow/10 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-paw-yellow opacity-20 dark:opacity-10 rounded-full blur-3xl scale-150 transform -translate-y-1/2"></div>
             <img 
               src="/assets/hero.png" 
               alt="Pawtopia Hero" 
               className="w-full h-full object-cover relative z-10"
             />
          </div>
          <div className="p-8 text-center bg-white dark:bg-paw-dark-card">
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4 text-paw-teal dark:text-white">
              Take Care of<br />Your Pet
            </h1>
            <p className="text-stone-400 dark:text-slate-500 font-medium mb-8 max-w-[250px] mx-auto">
              Everything your pet needs — all in one app
            </p>
            <Link
              to={user ? '/vets' : '/register'}
              className="inline-flex items-center gap-4 bg-paw-teal dark:bg-white dark:text-paw-teal text-white px-8 py-4 rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl shadow-paw-teal/20 active:scale-95"
            >
              <span className="w-10 h-10 bg-paw-yellow rounded-full flex items-center justify-center text-paw-teal text-xl">
                🐾
              </span>
              {user ? 'Find a Vet' : "Let's Go"}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Service Categories - Circle Style */}
      <section className="px-6 mb-12">
        <div className="flex justify-between items-center gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              to={cat.link}
              className="flex flex-col items-center gap-3 group flex-1"
            >
              <div className={`w-16 h-16 ${cat.bg} rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm`}>
                {cat.icon}
              </div>
              <span className="text-[10px] uppercase tracking-wider font-black text-stone-400 dark:text-slate-500 text-center">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Recommendations - Large Cards */}
      <section className="px-6 mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-paw-teal dark:text-white">Recommendation</h2>
          <button className="w-10 h-10 rounded-full border border-stone-200 dark:border-slate-700 flex items-center justify-center">
             <span className="text-lg">⚖️</span>
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {RECOMMENDATIONS.map(rec => (
            <div 
              key={rec.id}
              className={`${rec.bg} ${rec.textColor} min-w-[240px] p-6 rounded-4xl flex flex-col justify-between aspect-square relative overflow-hidden group shadow-lg`}
            >
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">{rec.tag}</span>
                <h3 className="text-xl font-black leading-snug max-w-[140px]">{rec.title}</h3>
              </div>
              <div className="text-6xl absolute -bottom-2 -right-2 transform group-hover:scale-110 transition-transform opacity-40">
                {rec.img}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Shopping - 3D Pet Heads */}
      <section className="px-6 mb-12">
        <h2 className="text-2xl font-black text-paw-teal dark:text-white mb-6">Shopping</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {SHOP_FILTERS.map(cat => (
            <Link
              key={cat.id}
              to={cat.link}
              className={`${cat.bg} rounded-3xl p-3 min-w-[100px] flex flex-col items-center gap-3 group transition-all hover:shadow-lg`}
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center">
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-black text-paw-teal dark:text-white">{cat.label}</span>
            </Link>
          ))}
        </div>
        
        {/* Promo Banner */}
        <div className="mt-6 bg-paw-teal dark:bg-paw-dark-card rounded-4xl p-6 flex items-center justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
               <span className="p-2 bg-white/10 rounded-xl">🏷️</span>
               <span className="font-black text-2xl">25% Off</span>
            </div>
            <p className="text-white/60 text-sm font-medium mb-4">On all pet products</p>
            <Link to="/shop" className="bg-paw-yellow text-paw-teal px-6 py-2 rounded-full font-black text-sm">
               Get Now
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-32 h-full bg-paw-yellow/10 transform skew-x-12 translate-x-16"></div>
        </div>
      </section>

      {/* 5. News Feed / Community - The Social Aspect */}
      <section className="px-6 mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-paw-teal dark:text-white">News feed</h2>
          <span className="text-2xl">💬</span>
        </div>
        <div className="bg-white dark:bg-paw-dark-card rounded-4xl overflow-hidden border border-stone-100 dark:border-slate-800 shadow-xl shadow-paw-teal/5">
          <div className="p-4 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-paw-yellow flex items-center justify-center text-lg">👩</div>
             <div>
                <p className="font-black text-sm dark:text-white">Sophia Mitch</p>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">New York</p>
             </div>
             <button className="ml-auto text-stone-300">•••</button>
          </div>
          <div className="bg-paw-orange/10 aspect-square flex items-center justify-center p-4">
             <div className="w-full h-full bg-paw-orange rounded-3xl relative overflow-hidden flex items-center justify-center">
                <img 
                  src="/assets/cat.png" 
                  alt="Post" 
                  className="w-2/3 h-2/3 object-contain"
                />
             </div>
          </div>
          <div className="p-6">
             <p className="text-sm font-medium leading-relaxed dark:text-slate-300 mb-4">
               Meet my little ball of fluff! This tiny troublemaker has already stolen my heart with his endless cuddles and playful paws.
             </p>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <span className="text-sm">❤️</span>
                   <span className="text-xs font-black text-stone-400">432</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-sm">💬</span>
                   <span className="text-xs font-black text-stone-400">65</span>
                </div>
                <span className="ml-auto text-[10px] font-black text-stone-300 uppercase tracking-widest">3 hours ago</span>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
