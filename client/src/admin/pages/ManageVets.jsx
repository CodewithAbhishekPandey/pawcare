import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ManageVets = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const ROWS_PER_PAGE = 20;

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      const res = await api.get('/admin/vets');
      if (res.data.success) {
        setVets(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching vets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const confirmMsg = `Are you sure you want to ${action} this vet?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (action === 'delete') {
        await api.delete(`/admin/vets/${id}`);
      } else {
        await api.patch(`/admin/vets/${id}/${action}`);
      }
      // Refresh list
      fetchVets();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} vet`);
    }
  };

  const filteredVets = vets.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'Verified') matchesStatus = v.clinic?.isVerified && !v.isSuspended;
    if (statusFilter === 'Pending Approval') matchesStatus = !v.clinic?.isVerified && !v.isSuspended;
    if (statusFilter === 'Suspended') matchesStatus = v.isSuspended;
    return matchesSearch && matchesStatus;
  });

  const paginatedVets = filteredVets.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const totalPages = Math.ceil(filteredVets.length / ROWS_PER_PAGE);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header & Filters */}
      <div className="p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full sm:w-80 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Verified">Verified</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">Name & Email</th>
              <th className="px-6 py-4 font-semibold">Clinic Name</th>
              <th className="px-6 py-4 font-semibold">Specializations</th>
              <th className="px-6 py-4 font-semibold">Consult Fee</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-500">Loading...</td></tr>
            ) : paginatedVets.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-500">No vets found.</td></tr>
            ) : (
              paginatedVets.map((vet) => (
                <tr key={vet._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{vet.name}</p>
                    <p className="text-sm text-slate-500">{vet.email}</p>
                    <p className="text-xs text-slate-400">{vet.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {vet.clinic?.name || <span className="text-slate-400 italic">No clinic</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {vet.specializations.join(', ') || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    ₹{vet.consultFee}
                  </td>
                  <td className="px-6 py-4">
                    {vet.isSuspended ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Suspended 🚫
                      </span>
                    ) : vet.clinic?.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Verified ✅
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Pending ⏳
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {!vet.clinic?.isVerified && !vet.isSuspended && (
                      <button onClick={() => handleAction(vet._id, 'approve')} className="text-green-600 hover:text-green-800 font-medium text-sm" title="Approve">
                        ✅ Approve
                      </button>
                    )}
                    {vet.isSuspended ? (
                      <button onClick={() => handleAction(vet._id, 'restore')} className="text-blue-600 hover:text-blue-800 font-medium text-sm" title="Restore">
                        ♻️ Restore
                      </button>
                    ) : (
                      <button onClick={() => handleAction(vet._id, 'suspend')} className="text-orange-600 hover:text-orange-800 font-medium text-sm" title="Suspend">
                        🚫 Suspend
                      </button>
                    )}
                    <button onClick={() => handleAction(vet._id, 'delete')} className="text-red-600 hover:text-red-800 font-medium text-sm" title="Delete">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * ROWS_PER_PAGE + 1} to {Math.min(page * ROWS_PER_PAGE, filteredVets.length)} of {filteredVets.length} entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-600 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVets;
