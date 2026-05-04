import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 1, label: 'Grooming', icon: '🪮', bg: 'bg-paw-yellow/20', color: 'text-paw-yellow' },
  { id: 2, label: 'Veterinary', icon: '❤️', bg: 'bg-paw-pink', color: 'text-pink-600' },
  { id: 3, label: 'Foods', icon: '🥩', bg: 'bg-paw-green', color: 'text-green-700' },
  { id: 4, label: 'More', icon: '💬', bg: 'bg-stone-200', color: 'text-stone-600' },
];

const SHOP_CATEGORIES = [
  { id: 'dog', label: 'Dog', img: '🐶', bg: 'bg-paw-yellow/40' },
  { id: 'cat', label: 'Cat', img: '🐱', bg: 'bg-paw-yellow/20' },
  { id: 'rodent', label: 'Rodent', img: '🐹', bg: 'bg-paw-pink' },
];

const Home = ({ settings = {} }) => {
  const { user } = useAuth();

  return (
    <div className="bg-paw-cream min-h-screen pb-24 font-sans text-paw-teal">
      
      {/* 1. Hero Section */}
      <section className="px-4 pt-4 mb-8">
        <div className="bg-paw-yellow rounded-[2.5rem] pt-8 px-6 pb-0 flex flex-col items-center relative overflow-hidden h-[350px]">
          <img 
            src="/assets/hero_3d_pet_owner.png" 
            alt="Happy pet owner" 
            className="w-full max-w-[280px] object-cover absolute bottom-0 object-bottom"
          />
        </div>
        
        <div className="text-center mt-8 px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-black leading-[1.1] mb-3">
            Take Care of<br/>Your Pet
          </h1>
          <p className="text-stone-500 font-medium text-sm md:text-base mb-8 max-w-xs mx-auto">
            Everything your pet needs<br/>— all in one app
          </p>
          
          <Link
            to={user ? "/vets" : "/register"}
            className="inline-flex items-center gap-3 bg-paw-teal text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all active:scale-95 shadow-xl shadow-paw-teal/20"
          >
            <span className="w-10 h-10 bg-paw-yellow rounded-full flex items-center justify-center text-paw-teal text-xl">
              🐾
            </span>
            Let's Go
          </Link>
        </div>
      </section>

      {/* 2. Categories Row */}
      <section className="px-6 mb-10 overflow-x-auto hide-scrollbar">
        <div className="flex justify-between md:justify-center md:gap-12 min-w-max">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className={`w-16 h-16 ${cat.bg} rounded-3xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform`}>
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-stone-600">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Recommendation Section */}
      <section className="px-6 mb-12 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-serif font-bold text-paw-teal">Recommendation</h2>
          <button className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100">
            <span className="text-xs">⇋</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="bg-paw-yellow rounded-[2rem] p-5 h-[260px] flex flex-col justify-between relative overflow-hidden group cursor-pointer">
            <div className="relative z-10">
              <span className="text-xs font-bold text-paw-teal/60 mb-1 block">Health</span>
              <h3 className="text-lg font-serif font-black leading-tight max-w-[120px]">The best locations for active walks</h3>
            </div>
            <img src="/assets/recommendation_active_walks.png" alt="Active walks" className="absolute -bottom-4 -right-4 w-40 h-40 object-contain group-hover:scale-110 transition-transform duration-500" />
          </div>
          
          {/* Card 2 */}
          <div className="bg-paw-orange rounded-[2rem] p-5 h-[260px] flex flex-col justify-between relative overflow-hidden group cursor-pointer text-white">
            <div className="relative z-10">
              <span className="text-xs font-bold text-white/70 mb-1 block">Education</span>
              <h3 className="text-lg font-serif font-black leading-tight max-w-[120px]">Five Simple Commands for dogs</h3>
            </div>
            <img src="/assets/recommendation_simple_commands.png" alt="Simple commands" className="absolute -bottom-4 -right-4 w-40 h-40 object-contain group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </section>

      {/* 4. Shopping Section Preview */}
      {settings.marketplace_enabled !== false && (
        <section className="px-6 mb-12 max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-serif font-bold text-paw-teal">Shopping</h2>
            <Link to="/shop" className="w-8 h-8 rounded-full bg-paw-cream border border-stone-200 flex items-center justify-center text-stone-500 relative">
              🛍️
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="bg-white rounded-full flex items-center px-5 py-3.5 mb-6 shadow-sm border border-stone-100">
            <span className="text-stone-400 mr-3">🔍</span>
            <input type="text" placeholder="Search by store" className="bg-transparent border-none outline-none text-sm w-full text-paw-teal placeholder-stone-400 font-medium" />
          </div>
          
          {/* Shop Categories */}
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 mb-6">
            {SHOP_CATEGORIES.map(cat => (
              <button key={cat.id} className={`flex flex-col items-center justify-end p-3 rounded-3xl ${cat.bg} min-w-[80px] h-28 relative group`}>
                <span className="text-4xl absolute top-2 group-hover:-translate-y-1 transition-transform">{cat.img}</span>
                <span className="text-sm font-bold text-paw-teal mt-auto">{cat.label}</span>
              </button>
            ))}
          </div>
          
          {/* Promo Banner */}
          <div className="bg-paw-teal rounded-3xl p-5 flex items-center justify-between text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">
                %
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg leading-tight">25% Off</h4>
                <p className="text-xs text-paw-teal/50 text-white/70">Pet products</p>
              </div>
            </div>
            <Link to="/shop" className="bg-paw-yellow text-paw-teal text-sm font-bold px-5 py-2.5 rounded-full hover:bg-yellow-400 transition-colors">
              Get Now
            </Link>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
