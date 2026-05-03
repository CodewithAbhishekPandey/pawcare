import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ settings = {} }) => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const linkCls = ({ isActive }) =>
    `font-medium text-sm transition-colors ${isActive ? 'text-rose-400' : 'text-slate-300 hover:text-white'}`;

  return (
    <header className="border-b border-white/10 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-2xl font-black bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">
            PawCare
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/vets" className={linkCls}>Find Vets</NavLink>
          {settings.marketplace_enabled !== false && <NavLink to="/shop" className={linkCls}>Shop</NavLink>}
          {user && <NavLink to="/appointments" className={linkCls}>Appointments</NavLink>}
          {settings.consult_enabled !== false && (
            <NavLink
              to="/instant-consult"
              className={({ isActive }) =>
                `flex items-center gap-1.5 font-semibold text-sm transition-colors ${
                  isActive ? 'text-rose-400' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              📹 Instant Consult
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Live
              </span>
            </NavLink>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Cart icon (pet_owner) */}
              {user.role === 'pet_owner' && (
                <Link
                  to="/cart"
                  className="relative p-2 text-slate-300 hover:text-white transition-colors"
                  title="Cart"
                >
                  🛒
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl text-sm transition-all"
              >
                Dashboard
              </Link>
              <span className="text-xs px-3 py-1.5 bg-white/10 rounded-full text-slate-300 font-medium capitalize">
                {user.role.replace('_', ' ')} · {user.name.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl text-sm font-medium transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm shadow-lg transition-all">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-slate-300 hover:text-white"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900 px-4 py-4 space-y-3">
          <NavLink to="/vets" className={({ isActive }) => `block py-2 font-medium text-sm ${isActive ? 'text-rose-400' : 'text-slate-300'}`} onClick={() => setMenuOpen(false)}>
            Find Vets
          </NavLink>
          {settings.marketplace_enabled !== false && (
            <NavLink to="/shop" className={({ isActive }) => `block py-2 font-medium text-sm ${isActive ? 'text-rose-400' : 'text-slate-300'}`} onClick={() => setMenuOpen(false)}>
              Shop
            </NavLink>
          )}
          {user && (
            <NavLink to="/appointments" className={({ isActive }) => `block py-2 font-medium text-sm ${isActive ? 'text-rose-400' : 'text-slate-300'}`} onClick={() => setMenuOpen(false)}>
              Appointments
            </NavLink>
          )}
          {settings.consult_enabled !== false && (
            <NavLink to="/instant-consult" className={({ isActive }) => `flex items-center gap-2 py-2 font-semibold text-sm ${isActive ? 'text-rose-400' : 'text-slate-300'}`} onClick={() => setMenuOpen(false)}>
              📹 Instant Consult
              <span className="px-1.5 py-0.5 bg-rose-500/20 border border-rose-500/24 text-rose-400 rounded-full text-xs font-bold">Live</span>
            </NavLink>
          )}
          <div className="pt-3 border-t border-slate-700">
            {user ? (
              <div className="space-y-2">
                {user.role === 'pet_owner' && (
                  <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-slate-300 text-sm">
                    🛒 Cart {totalItems > 0 && <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>}
                  </Link>
                )}
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-slate-300 text-sm">Dashboard</Link>
                <button onClick={handleLogout} className="w-full py-2 text-left text-slate-400 text-sm">Logout ({user.name})</button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 py-2 text-center border border-slate-600 rounded-xl text-slate-300 text-sm">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 py-2 text-center bg-rose-500 rounded-xl text-white font-bold text-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
