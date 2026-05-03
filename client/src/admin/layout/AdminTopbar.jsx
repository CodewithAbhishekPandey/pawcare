import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const AdminTopbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [pendingVets, setPendingVets] = useState(0);

  useEffect(() => {
    const fetchPendingVets = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setPendingVets(res.data.data.pendingVetApprovals || 0);
        }
      } catch (err) {
        console.error('Error fetching pending vets count', err);
      }
    };
    fetchPendingVets();
  }, []);

  // Map route to title
  const getPageTitle = (pathname) => {
    if (pathname.includes('/vets/add')) return 'Add Vet';
    if (pathname.includes('/vets')) return 'Manage Vets';
    if (pathname.includes('/clinics')) return 'Manage Clinics';
    if (pathname.includes('/products/add')) return 'Add Product';
    if (pathname.includes('/products')) return 'Manage Products';
    if (pathname.includes('/users')) return 'Manage Users';
    if (pathname.includes('/appointments')) return 'Manage Appointments';
    if (pathname.includes('/consults')) return 'Manage Consult Sessions';
    if (pathname.includes('/orders')) return 'Manage Orders';
    if (pathname.includes('/settings')) return 'Site Settings';
    if (pathname.includes('/dashboard')) return 'Dashboard Overview';
    return 'Admin Panel';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-xl font-bold text-slate-800">
        {getPageTitle(location.pathname)}
      </h1>
      
      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer text-slate-600 hover:text-slate-800 transition-colors">
          <span className="text-xl">🔔</span>
          {pendingVets > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {pendingVets}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">👤 {user?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
