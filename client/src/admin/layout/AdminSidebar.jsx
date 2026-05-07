import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vetsOpen, setVetsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive
        ? 'bg-[#1D9E75]/10 text-[#1D9E75] border-l-4 border-[#1D9E75]'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-4 border-transparent'
    }`;

  const subNavLinkClasses = ({ isActive }) =>
    `block px-11 py-2 text-sm transition-colors ${
      isActive ? 'text-[#1D9E75] font-semibold' : 'text-slate-500 hover:text-slate-300'
    }`;

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-xl font-bold text-white flex items-center gap-2">
          🐾 Pawvetra <span className="text-[#1D9E75]">Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <NavLink to="/admin/dashboard" end className={navLinkClasses}>
          <span>📊</span> Dashboard
        </NavLink>

        {/* Vets & Clinics Expandable */}
        <div>
          <button
            onClick={() => setVetsOpen(!vetsOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-4 border-transparent transition-colors`}
          >
            <div className="flex items-center gap-3">
              <span>🩺</span> Vets & Clinics
            </div>
            <span className="text-xs">{vetsOpen ? '▼' : '▶'}</span>
          </button>
          {vetsOpen && (
            <div className="mt-1 space-y-1">
              <NavLink to="/admin/vets" end className={subNavLinkClasses}>Manage Vets</NavLink>
              <NavLink to="/admin/vets/add" className={subNavLinkClasses}>Add Vet</NavLink>
              <NavLink to="/admin/clinics" className={subNavLinkClasses}>Manage Clinics</NavLink>
            </div>
          )}
        </div>

        {/* Products Expandable */}
        <div>
          <button
            onClick={() => setProductsOpen(!productsOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-4 border-transparent transition-colors`}
          >
            <div className="flex items-center gap-3">
              <span>📦</span> Products
            </div>
            <span className="text-xs">{productsOpen ? '▼' : '▶'}</span>
          </button>
          {productsOpen && (
            <div className="mt-1 space-y-1">
              <NavLink to="/admin/products" end className={subNavLinkClasses}>Manage Products</NavLink>
              <NavLink to="/admin/products/add" className={subNavLinkClasses}>Add Product</NavLink>
            </div>
          )}
        </div>

        <NavLink to="/admin/users" className={navLinkClasses}>
          <span>👥</span> Users
        </NavLink>
        <NavLink to="/admin/appointments" className={navLinkClasses}>
          <span>📅</span> Appointments
        </NavLink>
        <NavLink to="/admin/consults" className={navLinkClasses}>
          <span>💻</span> Consult Sessions
        </NavLink>
        <NavLink to="/admin/orders" className={navLinkClasses}>
          <span>🛒</span> Orders
        </NavLink>
        <NavLink to="/admin/delivery-agents" className={navLinkClasses}>
          <span>🛵</span> Delivery Agents
        </NavLink>
        <NavLink to="/admin/settings" className={navLinkClasses}>
          <span>⚙️</span> Site Settings
        </NavLink>
      </nav>

      {/* Bottom Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
