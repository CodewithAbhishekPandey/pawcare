import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageConsults = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewSession, setViewSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, paymentFilter, dateFrom, dateTo]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      let query = '/admin/consults?';
      if (statusFilter) query += `status=${statusFilter}&`;
      if (paymentFilter) query += `paymentStatus=${paymentFilter}&`;
      if (dateFrom) query += `from=${dateFrom}&`;
      if (dateTo) query += `to=${dateTo}&`;
      
      const res = await api.get(query);
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching consult sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (id) => {
    if (!window.confirm('Are you sure you want to issue a manual refund? This will call Razorpay.')) return;
    try {
      await api.post(`/admin/consults/${id}/refund`);
      alert('Refund processed successfully');
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund');
    }
  };

  // Stats
  const totalRevenue = sessions.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + (s.fee || 0), 0);
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const avgDuration = completedSessions.length > 0 
    ? (completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length).toFixed(1) 
    : 0;
  const avgRating = completedSessions.filter(s => s.ownerRating).length > 0
    ? (completedSessions.reduce((sum, s) => sum + (s.ownerRating || 0), 0) / completedSessions.filter(s => s.ownerRating).length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Sessions</p>
          <p className="text-2xl font-bold text-slate-800">{sessions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-bold text-[#1D9E75]">₹{totalRevenue}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Avg Duration</p>
          <p className="text-2xl font-bold text-slate-800">{avgDuration} min</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Avg Rating</p>
          <p className="text-2xl font-bold text-orange-500">{avgRating} ★</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
              <span className="self-center text-slate-500">to</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="waiting">Waiting in Queue</option>
                <option value="in_call">In Call</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">ID & Date</th>
                <th className="px-6 py-4 font-semibold">Participants</th>
                <th className="px-6 py-4 font-semibold">Fee</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10 text-slate-500">Loading...</td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-slate-500">No sessions found.</td></tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-slate-800">{s._id.toString().slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm"><span className="text-slate-500">Owner:</span> {s.petOwnerRef?.name}</p>
                      <p className="text-sm"><span className="text-slate-500">Vet:</span> Dr. {s.vetRef?.name}</p>
                      <p className="text-xs text-slate-400 mt-1">Pet: {s.petName} ({s.petType})</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">₹{s.fee}</td>
                    <td className="px-6 py-4 text-sm font-medium capitalize">
                      <span className={`${s.paymentStatus === 'paid' ? 'text-green-600' : s.paymentStatus === 'refunded' ? 'text-orange-600' : 'text-slate-500'}`}>
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium capitalize">
                      <span className={`px-2 py-1 rounded ${
                        s.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        s.status === 'in_call' ? 'bg-[#1D9E75]/20 text-[#1D9E75]' :
                        s.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                        s.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {s.ownerRating ? <span className="text-orange-500">{s.ownerRating} ★</span> : '-'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => setViewSession(s)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">👁️ View</button>
                      {s.paymentStatus === 'paid' && s.status === 'cancelled' && (
                        <button onClick={() => handleRefund(s._id)} className="text-orange-600 hover:text-orange-800 text-sm font-medium">💰 Refund</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewSession && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewSession(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-slate-800">Session Details</h3>
              <button onClick={() => setViewSession(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <p className="font-bold capitalize">{viewSession.status.replace('_', ' ')}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Payment</p>
                  <p className="font-bold capitalize">{viewSession.paymentStatus}</p>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                <p><span className="font-medium text-slate-500 inline-block w-24">Vet:</span> Dr. {viewSession.vetRef?.name}</p>
                <p><span className="font-medium text-slate-500 inline-block w-24">Owner:</span> {viewSession.petOwnerRef?.name}</p>
                <p><span className="font-medium text-slate-500 inline-block w-24">Pet:</span> {viewSession.petName} ({viewSession.petType})</p>
                <p><span className="font-medium text-slate-500 inline-block w-24">Issue:</span> {viewSession.issue || 'N/A'}</p>
              </div>

              {viewSession.status === 'completed' && (
                <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-blue-50">
                  <p><span className="font-medium text-slate-500 inline-block w-24">Duration:</span> {viewSession.duration} mins</p>
                  <p><span className="font-medium text-slate-500 inline-block w-24">Rating:</span> {viewSession.ownerRating ? `${viewSession.ownerRating} ★` : 'N/A'}</p>
                  <p><span className="font-medium text-slate-500 inline-block w-24">Review:</span> {viewSession.ownerReview || 'N/A'}</p>
                </div>
              )}
              
              <div className="text-xs text-slate-400 break-all">
                <p>RP Order ID: {viewSession.razorpayOrderId}</p>
                <p>RP Payment ID: {viewSession.razorpayPaymentId || 'N/A'}</p>
              </div>
            </div>
            
            <button onClick={() => setViewSession(null)} className="w-full mt-6 py-2 bg-slate-800 text-white rounded-xl font-medium">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageConsults;
