import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-2xl transition-all duration-500 hover:scale-110 active:scale-95 bg-white dark:bg-slate-800 shadow-xl shadow-paw-teal/5 dark:shadow-none border border-stone-100 dark:border-slate-700 group flex items-center justify-center overflow-hidden"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {/* Sun icon */}
      <svg
        className={`w-6 h-6 text-paw-yellow transition-all duration-500 absolute ${
          theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
        fill="currentColor" viewBox="0 0 24 24"
      >
        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
      </svg>
      {/* Moon icon */}
      <svg
        className={`w-6 h-6 text-paw-teal dark:text-slate-400 transition-all duration-500 ${
          theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
        fill="currentColor" viewBox="0 0 24 24"
      >
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
      </svg>
    </button>
  );
};

const Navbar = ({ settings = {} }) => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const desktopLinkCls = ({ isActive }) =>
    `font-black text-xs uppercase tracking-widest transition-all ${
      isActive ? 'text-paw-teal dark:text-white scale-110' : 'text-stone-400 dark:text-slate-500 hover:text-paw-teal dark:hover:text-white'
    }`;

  const mobileLinkCls = (path) => {
    const isActive = location.pathname === path;
    return `flex flex-col items-center justify-center w-14 h-14 rounded-3xl transition-all duration-500 ${
      isActive ? 'bg-paw-teal text-white shadow-2xl shadow-paw-teal/40 transform -translate-y-4' : 'text-stone-300 dark:text-slate-600 hover:text-paw-teal'
    }`;
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-paw-cream/80 dark:bg-paw-dark/80 backdrop-blur-xl sticky top-0 z-40 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-paw-yellow rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">🐾</div>
            <span className="text-2xl font-black text-paw-teal dark:text-white tracking-tighter lowercase">
              pawtopia
            </span>
          </Link>

          {/* Desktop Nav - Pill Style */}
          <nav className="hidden lg:flex items-center gap-10 bg-white/50 dark:bg-slate-800/50 px-10 py-4 rounded-full border border-white/20 dark:border-slate-700/30 backdrop-blur-sm">
            <NavLink to="/" className={desktopLinkCls} end>Home</NavLink>
            <NavLink to="/vets" className={desktopLinkCls}>Find Vets</NavLink>
            {settings.marketplace_enabled !== false && <NavLink to="/shop" className={desktopLinkCls}>Shop</NavLink>}
            {settings.consult_enabled !== false && <NavLink to="/instant-consult" className={desktopLinkCls}>Consult</NavLink>}
            {user && <NavLink to="/appointments" className={desktopLinkCls}>Bookings</NavLink>}
          </nav>

          {/* Desktop Auth & Theme */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'pet_owner' && (
                  <Link
                    to="/cart"
                    className="relative w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-paw-teal/5 dark:shadow-none flex items-center justify-center text-xl transition-transform hover:scale-110"
                    title="Cart"
                  >
                    <span>🛍️</span>
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-paw-orange text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-paw-teal dark:bg-white dark:text-paw-teal text-white font-black rounded-2xl text-sm transition-all hover:shadow-2xl hover:shadow-paw-teal/20"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-12 h-12 flex items-center justify-center text-stone-400 hover:text-paw-orange transition-colors"
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-6 py-3 text-stone-400 dark:text-slate-500 hover:text-paw-teal dark:hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-8 py-3 bg-paw-teal dark:bg-white dark:text-paw-teal text-white font-black rounded-2xl text-sm shadow-xl shadow-paw-teal/20 transition-all hover:scale-105">
                  Let's Go
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Cart & Theme Toggle (Top right on mobile) */}
          <div className="flex md:hidden items-center gap-4">
             <ThemeToggle />
             {user && user.role === 'pet_owner' && (
               <Link to="/cart" className="relative w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl">
                 <span>🛍️</span>
                 {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-paw-orange text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                      {totalItems}
                    </span>
                 )}
               </Link>
             )}
             {!user && (
               <Link to="/login" className="text-xs font-black uppercase tracking-widest text-paw-teal dark:text-white">Sign In</Link>
             )}
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-none z-50 px-4 py-3 rounded-[40px] w-[90%] max-w-[400px]">
        <div className="flex justify-between items-center">
          <Link to="/" className={mobileLinkCls('/')}>
            <span className="text-2xl">🏠</span>
          </Link>
          <Link to="/vets" className={mobileLinkCls('/vets')}>
            <span className="text-2xl">🧭</span>
          </Link>
          {settings.marketplace_enabled !== false && (
            <Link to="/shop" className={mobileLinkCls('/shop')}>
              <span className="text-2xl">🏪</span>
            </Link>
          )}
          {settings.consult_enabled !== false && (
            <Link to="/instant-consult" className={mobileLinkCls('/instant-consult')}>
              <span className="text-2xl">📹</span>
            </Link>
          )}
          {user ? (
             <Link to="/dashboard" className={mobileLinkCls('/dashboard')}>
                <span className="text-2xl">👤</span>
             </Link>
          ) : (
             <Link to="/register" className={mobileLinkCls('/register')}>
                <span className="text-2xl">✨</span>
             </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
