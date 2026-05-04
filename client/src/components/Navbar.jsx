import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ settings = {} }) => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const desktopLinkCls = ({ isActive }) =>
    `font-semibold text-sm transition-colors ${
      isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-emerald-900'
    }`;

  const mobileLinkCls = (path) => {
    const isActive = location.pathname === path;
    return `flex flex-col items-center justify-center w-full py-2 space-y-1 ${
      isActive ? 'text-emerald-700' : 'text-slate-400 hover:text-emerald-600'
    }`;
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-2xl font-extrabold text-emerald-900 tracking-tight">
              PawCare
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={desktopLinkCls} end>Home</NavLink>
            <NavLink to="/vets" className={desktopLinkCls}>Find Vets</NavLink>
            {settings.marketplace_enabled !== false && <NavLink to="/shop" className={desktopLinkCls}>Shop</NavLink>}
            {user && <NavLink to="/appointments" className={desktopLinkCls}>Bookings</NavLink>}
            {settings.consult_enabled !== false && (
              <NavLink
                to="/instant-consult"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 font-bold text-sm transition-colors ${
                    isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-emerald-900'
                  }`
                }
              >
                📹 Instant Consult
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </NavLink>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'pet_owner' && (
                  <Link
                    to="/cart"
                    className="relative p-2 text-slate-500 hover:text-emerald-900 transition-colors"
                    title="Cart"
                  >
                    <span className="text-xl">🛒</span>
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold rounded-2xl text-sm transition-all"
                >
                  Dashboard
                </Link>
                <span className="text-xs px-3 py-1.5 bg-stone-100 rounded-full text-slate-600 font-medium capitalize">
                  {user.role.replace('_', ' ')} · {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium text-sm transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-slate-500 hover:text-slate-900 text-sm font-semibold transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-3xl text-sm shadow-sm transition-all transform hover:scale-105">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Cart Icon (Top right on mobile) */}
          <div className="flex md:hidden items-center gap-3">
             {user && user.role === 'pet_owner' && (
               <Link to="/cart" className="relative p-2 text-slate-600">
                 <span className="text-xl">🛒</span>
                 {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                 )}
               </Link>
             )}
             {!user && (
               <Link to="/login" className="text-sm font-bold text-emerald-700">Sign In</Link>
             )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link to="/" className={mobileLinkCls('/')}>
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link to="/vets" className={mobileLinkCls('/vets')}>
            <span className="text-xl">🔍</span>
            <span className="text-[10px] font-semibold">Search</span>
          </Link>
          {settings.marketplace_enabled !== false && (
            <Link to="/shop" className={mobileLinkCls('/shop')}>
              <span className="text-xl">🛍️</span>
              <span className="text-[10px] font-semibold">Shop</span>
            </Link>
          )}
          {user ? (
             <Link to="/appointments" className={mobileLinkCls('/appointments')}>
                <span className="text-xl">📅</span>
                <span className="text-[10px] font-semibold">Bookings</span>
             </Link>
          ) : (
             <Link to="/register" className={mobileLinkCls('/register')}>
                <span className="text-xl">✨</span>
                <span className="text-[10px] font-semibold">Join</span>
             </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
