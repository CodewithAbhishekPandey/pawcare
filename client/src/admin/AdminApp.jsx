import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminPrivateRoute from './AdminPrivateRoute';
import AdminSidebar from './layout/AdminSidebar';
import AdminTopbar from './layout/AdminTopbar';

// Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageVets from './pages/ManageVets';
import AddVet from './pages/AddVet';
import ManageClinics from './pages/ManageClinics';
import ManageProducts from './pages/ManageProducts';
import AddProduct from './pages/AddProduct';
import ManageUsers from './pages/ManageUsers';
import ManageOrders from './pages/ManageOrders';
import ManageDeliveryAgents from './pages/ManageDeliveryAgents';
import ManageAppointments from './pages/ManageAppointments';
import ManageConsults from './pages/ManageConsults';
import SiteSettings from './pages/SiteSettings';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-6 text-slate-800">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="vets" element={<ManageVets />} />
            <Route path="vets/add" element={<AddVet />} />
            <Route path="clinics" element={<ManageClinics />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="delivery-agents" element={<ManageDeliveryAgents />} />
            <Route path="appointments" element={<ManageAppointments />} />
            <Route path="consults" element={<ManageConsults />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AdminApp = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminPrivateRoute />}>
        <Route path="/*" element={<AdminLayout />} />
      </Route>
    </Routes>
  );
};

export default AdminApp;
