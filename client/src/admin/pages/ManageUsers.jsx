import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (id, currentStatus) => {
    const action = currentStatus ? 'unban' : 'ban';
    const msg = `Are you sure you want to ${action} this user?`;
    if (!window.confirm(msg)) return;

    try {
      await api.patch(`/admin/users/${id}/${action}`);
      fetchUsers();
    } catch (err) {
      alert(`Failed to ${action} user`);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    let matchesStatus = true;
    if (statusFilter === 'Active') matchesStatus = !u.isBanned;
    if (statusFilter === 'Banned') matchesStatus = u.isBanned;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full sm:w-80 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="pet_owner">Pet Owner</option>
              <option value="vet">Vet</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">Name & Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold">Activity</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-500">Loading...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-500">No users found.</td></tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                    <p className="text-xs text-slate-400">{u.phone}</p>
                  </td>
                  <td className="px-6 py-4 capitalize text-slate-600">
                    {u.role.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {u.role === 'pet_owner' ? (
                      <>
                        <p>{u.appointmentsCount || 0} Appts</p>
                        <p>{u.ordersCount || 0} Orders</p>
                      </>
                    ) : u.role === 'vet' ? (
                      <p>{u.consultsCount || 0} Consults</p>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {u.isBanned ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Banned 🚫</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active ✅</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => setViewUser(u)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">👁️ View</button>
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => handleBanToggle(u._id, u.isBanned)} 
                        className={`text-sm font-medium ${u.isBanned ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}`}
                      >
                        {u.isBanned ? '✅ Unban' : '🚫 Ban'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewUser(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-slate-800">User Profile</h3>
              <button onClick={() => setViewUser(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#1D9E75]/10 rounded-full flex items-center justify-center text-2xl text-[#1D9E75] font-bold">
                  {viewUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">{viewUser.name}</h4>
                  <p className="text-sm text-slate-500 capitalize">{viewUser.role.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm">
                <p><span className="text-slate-500 font-medium">Email:</span> {viewUser.email}</p>
                <p><span className="text-slate-500 font-medium">Phone:</span> {viewUser.phone || 'N/A'}</p>
                <p><span className="text-slate-500 font-medium">Joined:</span> {new Date(viewUser.createdAt).toLocaleString()}</p>
                <p><span className="text-slate-500 font-medium">Status:</span> {viewUser.isBanned ? 'Banned' : 'Active'}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600">{viewUser.appointmentsCount || 0}</p>
                  <p className="text-xs text-blue-800 font-medium mt-1">Appts</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <p className="text-2xl font-bold text-orange-600">{viewUser.ordersCount || 0}</p>
                  <p className="text-xs text-orange-800 font-medium mt-1">Orders</p>
                </div>
                <div className="bg-[#1D9E75]/10 p-3 rounded-lg border border-[#1D9E75]/20">
                  <p className="text-2xl font-bold text-[#1D9E75]">{viewUser.consultsCount || 0}</p>
                  <p className="text-xs text-[#1D9E75] font-medium mt-1">Consults</p>
                </div>
              </div>
            </div>
            
            <button onClick={() => setViewUser(null)} className="w-full mt-6 py-2 bg-slate-800 text-white rounded-xl font-medium">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
