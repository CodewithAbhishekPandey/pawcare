import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, typeFilter, dateFrom, dateTo]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = '/admin/appointments?';
      if (statusFilter) query += `status=${statusFilter}&`;
      if (typeFilter) query += `type=${typeFilter}&`;
      if (dateFrom) query += `from=${dateFrom}&`;
      if (dateTo) query += `to=${dateTo}&`;
      
      const res = await api.get(query);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/admin/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const exportCSV = () => {
    if (appointments.length === 0) return;
    
    const headers = ['ID', 'Pet Owner', 'Owner Email', 'Clinic', 'Date', 'Time Slot', 'Pet Name', 'Pet Type', 'Type', 'Status'];
    const rows = appointments.map(a => [
      a._id.toString().slice(-8),
      `"${a.petOwnerRef?.name || ''}"`,
      a.petOwnerRef?.email || '',
      `"${a.clinicRef?.name || ''}"`,
      new Date(a.date).toLocaleDateString(),
      a.timeSlot,
      a.petName,
      a.petType,
      a.type,
      a.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
            <span className="self-center text-slate-500">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="in_person">In Person</option>
              <option value="scheduled_online">Scheduled Online</option>
            </select>
            <button onClick={exportCSV} className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">ID</th>
              <th className="px-6 py-4 font-semibold">Pet Owner</th>
              <th className="px-6 py-4 font-semibold">Clinic</th>
              <th className="px-6 py-4 font-semibold">Date & Time</th>
              <th className="px-6 py-4 font-semibold">Pet</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="8" className="text-center py-10 text-slate-500">Loading...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-10 text-slate-500">No appointments found.</td></tr>
            ) : (
              appointments.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {a._id.toString().slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{a.petOwnerRef?.name}</p>
                    <p className="text-xs text-slate-500">{a.petOwnerRef?.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]">
                    {a.clinicRef?.name}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{new Date(a.date).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-500">{a.timeSlot}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800">{a.petName}</p>
                    <p className="text-xs text-slate-500">{a.petType}</p>
                  </td>
                  <td className="px-6 py-4">
                    {a.type === 'in_person' ? '🏥 In Person' : '💻 Online'}
                  </td>
                  <td className="px-6 py-4 text-sm capitalize font-medium">
                    <span className={`px-2 py-1 rounded ${
                      a.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      a.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {a.status !== 'cancelled' && a.status !== 'completed' && (
                      <button onClick={() => handleCancel(a._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                        🗑️ Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageAppointments;
