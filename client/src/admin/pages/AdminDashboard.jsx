import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../api/axios';

const COLORS = ['#1D9E75', '#3B82F6', '#F59E0B', '#EF4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1D9E75]"></div>
      </div>
    );
  }

  if (!stats) return <div className="text-red-500">Failed to load stats.</div>;

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="bg-blue-500" />
        <StatCard title="Total Vets" value={stats.totalVets} icon="🩺" color="bg-indigo-500" />
        <StatCard title="Orders (This Month)" value={stats.totalOrdersThisMonth} icon="🛒" color="bg-orange-500" />
        <StatCard title="Revenue (This Month)" value={`₹${stats.totalRevenue}`} icon="💰" color="bg-[#1D9E75]" />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Vet Approvals</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.pendingVetApprovals}</p>
          </div>
          {stats.pendingVetApprovals > 0 && (
            <Link to="/admin/vets" className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-sm font-medium transition-colors">
              Review Now
            </Link>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Consult Sessions</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.activeConsults}</p>
          </div>
          <div className="text-4xl">💻</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock Products</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.lowStockProducts}</p>
          </div>
          {stats.lowStockProducts > 0 && (
            <Link to="/admin/products?filter=low_stock" className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors">
              View
            </Link>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Appointments & Orders (Last 14 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.appointmentsByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" name="Appointments" dataKey="count" stroke="#1D9E75" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Types Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Service Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.appointmentTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name.replace('_', ' ')} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.appointmentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
        </div>
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {stats.recentActivity.length === 0 ? (
            <p className="p-6 text-slate-500 text-center">No recent activity.</p>
          ) : (
            stats.recentActivity.map((activity, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  activity.type === 'user_registered' ? 'bg-blue-500' :
                  activity.type === 'vet_applied' ? 'bg-indigo-500' :
                  activity.type === 'order_placed' ? 'bg-orange-500' :
                  'bg-[#1D9E75]'
                }`}>
                  {activity.type === 'user_registered' && '👤'}
                  {activity.type === 'vet_applied' && '🩺'}
                  {activity.type === 'order_placed' && '🛒'}
                  {activity.type === 'consult_completed' && '💻'}
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-medium">{activity.text}</p>
                  <p className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
