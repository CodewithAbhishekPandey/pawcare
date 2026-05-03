import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminPrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a spinner

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminPrivateRoute;
