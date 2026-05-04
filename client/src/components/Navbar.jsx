import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

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
    `font-semibold text-sm transition-colors ${
      isActive ? 'text-paw-teal font-bold' : 'text-slate-500 hover:text-paw-teal'
    }`;

  const mobileLinkCls = (path) => {
    const isActive = location.pathname === path;
    return `flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
      isActive ? 'bg-paw-teal text-white shadow-lg transform -translate-y-2' : 'text-slate-400 hover:text-paw-teal'
    }`;
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-paw-cream sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl font-serif font-black text-paw-teal tracking-tighter lowercase">
              pawtopia
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 bg-white px-8 py-3 rounded-full shadow-sm border border-stone-100">
            <NavLink to="/" className={desktopLinkCls} end>Home</NavLink>
            <NavLink to="/vets" className={desktopLinkCls}>Find Vets</NavLink>
            {settings.marketplace_enabled !== false && <NavLink to="/shop" className={desktopLinkCls}>Shop</NavLink>}
            {user && <NavLink to="/appointments" className={desktopLinkCls}>Bookings</NavLink>}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'pet_owner' && (
                  <Link
                    to="/cart"
                    className="relative p-3 bg-white rounded-full shadow-sm text-paw-teal hover:bg-stone-50 transition-colors"
                    title="Cart"
                  >
                    <span className="text-lg">🛒</span>
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-paw-orange text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 bg-paw-teal hover:bg-opacity-90 text-white font-semibold rounded-full text-sm transition-all"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-slate-500 hover:text-paw-orange font-medium text-sm transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-slate-500 hover:text-paw-teal text-sm font-semibold transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-6 py-2.5 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-full text-sm shadow-md transition-all transform hover:scale-105">
                  Let's Go
                </Link>
              </>
            )}
          </div>

          {/* Mobile Cart & Notification (Top right on mobile) */}
          <div className="flex md:hidden items-center gap-4">
             {user && user.role === 'pet_owner' && (
               <Link to="/cart" className="relative p-2 bg-white rounded-full shadow-sm text-paw-teal">
                 <span className="text-xl">🛍️</span>
                 {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-paw-orange text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                 )}
               </Link>
             )}
             {!user && (
               <Link to="/login" className="text-sm font-bold text-paw-teal">Sign In</Link>
             )}
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-stone-200/50 shadow-2xl z-50 px-3 py-2 rounded-full w-[90%] max-w-[400px]">
        <div className="flex justify-between items-center relative">
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
          {user ? (
             <Link to="/appointments" className={mobileLinkCls('/appointments')}>
                <span className="text-2xl">🔖</span>
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
