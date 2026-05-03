import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  
  const [cancelModal, setCancelModal] = useState({ show: false, orderId: null, reason: '', refundAmount: 0 });
  
  // Assign agent form state
  const [assignForm, setAssignForm] = useState({ agentId: '', estimatedDelivery: '' });

  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/admin/delivery-agents?isActive=true');
      if (res.data.success) {
        setAgents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching agents', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleCancelOrder = async () => {
    try {
      await api.post(`/admin/orders/${cancelModal.orderId}/cancel`, {
        reason: cancelModal.reason,
        refundAmount: cancelModal.refundAmount
      });
      setCancelModal({ show: false, orderId: null, reason: '', refundAmount: 0 });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleAssignAgent = async (orderId) => {
    if (!assignForm.agentId) return alert('Please select an agent');
    try {
      const res = await api.patch(`/admin/orders/${orderId}/assign-agent`, assignForm);
      setViewOrder(res.data.data); // Update view modal
      fetchOrders();
      setAssignForm({ agentId: '', estimatedDelivery: '' });
      alert('Agent assigned successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign agent');
    }
  };

  const filteredOrders = orders.filter(o => {
    let match = true;
    if (statusFilter !== 'All') {
      match = match && (o.status === statusFilter.toLowerCase());
    }
    if (unassignedOnly) {
      match = match && (!o.assignedAgent && o.status === 'placed');
    }
    return match;
  });

  // Stats
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total : sum, 0);
  const avgOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : 0;
  const pendingCount = orders.filter(o => o.status === 'placed').length;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-2xl font-bold text-slate-800">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-bold text-[#1D9E75]">₹{totalRevenue}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Avg Order Value</p>
          <p className="text-2xl font-bold text-slate-800">₹{avgOrderValue}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Pending Orders</p>
          <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filter Tabs & Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-slate-50 p-2">
          <div className="flex overflow-x-auto space-x-2">
            {['All', 'Placed', 'Processing', 'Delivered', 'Cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-white text-[#1D9E75] shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-3 sm:mt-0 px-2 flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer text-sm text-slate-700 font-medium">
              <input 
                type="checkbox" 
                checked={unassignedOnly} 
                onChange={(e) => setUnassignedOnly(e.target.checked)}
                className="w-4 h-4 text-[#1D9E75] rounded focus:ring-[#1D9E75]"
              />
              <span>Unassigned Placed Orders Only</span>
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Order ID & Date</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Total (Items)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Agent</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-slate-500">Loading...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-slate-500">No orders found.</td></tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">#{o._id.toString().slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{o.userRef?.name}</p>
                      <p className="text-xs text-slate-500">{o.userRef?.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">₹{o.total}</p>
                      <p className="text-xs text-slate-500">{o.items.reduce((sum, i) => sum + i.qty, 0)} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1 items-start">
                        {o.isCancelled ? (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-medium">Cancelled</span>
                        ) : (
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                            className={`text-sm font-medium px-2 py-1 rounded border outline-none ${
                              o.status === 'placed' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              o.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              o.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}
                            disabled={o.status === 'delivered'}
                          >
                            <option value="placed">Placed</option>
                            <option value="processing">Processing</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        )}
                        {o.isCancelled && o.refundStatus !== 'na' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${o.refundStatus === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>Refund: {o.refundStatus}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {o.assignedAgent ? (
                        <p className="text-sm font-medium text-slate-800">{o.assignedAgent.name || 'Assigned'}</p>
                      ) : (
                        <p className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded inline-block">Unassigned</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {!o.isCancelled && o.status !== 'delivered' && (
                        <button 
                          onClick={() => setCancelModal({ show: true, orderId: o._id, reason: '', refundAmount: o.paymentMethod === 'prepaid' ? o.total : 0 })} 
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      )}
                      <button onClick={() => setViewOrder(o)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Cancel Order</h3>
            <p className="text-sm text-slate-500 mb-4">Are you sure you want to cancel order #{cancelModal.orderId?.slice(-6).toUpperCase()}?</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for cancellation *</label>
                <textarea
                  required
                  rows="2"
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal({...cancelModal, reason: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="e.g., Customer requested, Out of stock..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={cancelModal.refundAmount}
                  onChange={(e) => setCancelModal({...cancelModal, refundAmount: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">If prepaid, this sets a pending refund.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal({show: false, orderId: null, reason: '', refundAmount: 0})} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Keep Order</button>
              <button onClick={handleCancelOrder} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={() => setViewOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Order #{viewOrder._id.toString().slice(-8).toUpperCase()}
                  {viewOrder.isCancelled && <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-medium">Cancelled</span>}
                </h3>
                <p className="text-sm text-slate-500">{new Date(viewOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">Customer Details</h4>
                <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Name:</span> {viewOrder.userRef?.name}</p>
                <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Email:</span> {viewOrder.userRef?.email}</p>
                <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Phone:</span> {viewOrder.userRef?.phone}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">Delivery Address</h4>
                <p className="text-sm text-slate-600">{viewOrder.address}</p>
              </div>
            </div>

            {/* Delivery Agent Section */}
            {!viewOrder.isCancelled && viewOrder.status !== 'delivered' && (
              <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-3">Delivery Agent</h4>
                {viewOrder.assignedAgent ? (
                  <div className="flex justify-between items-center bg-white p-3 rounded border border-blue-100">
                    <div>
                      <p className="font-bold text-slate-800">{viewOrder.assignedAgent.name || 'Assigned Agent'}</p>
                      <p className="text-xs text-slate-500">Assigned: {new Date(viewOrder.assignedAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Est. Delivery</p>
                      <p className="font-bold text-[#1D9E75]">{viewOrder.estimatedDelivery ? new Date(viewOrder.estimatedDelivery).toLocaleString() : 'N/A'}</p>
                    </div>
                    <button onClick={() => setAssignForm({ agentId: viewOrder.assignedAgent._id || viewOrder.assignedAgent, estimatedDelivery: '' })} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium hover:bg-blue-200">Reassign</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 px-3 py-2 border rounded-lg outline-none text-sm"
                      value={assignForm.agentId}
                      onChange={(e) => setAssignForm({...assignForm, agentId: e.target.value})}
                    >
                      <option value="">Select Agent</option>
                      {agents.map(a => <option key={a._id} value={a._id}>{a.name} ({a.area || 'All'})</option>)}
                    </select>
                    <input 
                      type="datetime-local" 
                      className="flex-1 px-3 py-2 border rounded-lg outline-none text-sm"
                      value={assignForm.estimatedDelivery}
                      onChange={(e) => setAssignForm({...assignForm, estimatedDelivery: e.target.value})}
                    />
                    <button 
                      onClick={() => handleAssignAgent(viewOrder._id)}
                      className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg font-bold text-sm hover:bg-[#168a65]"
                    >
                      Assign
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <h4 className="font-bold text-slate-800 mb-3">Order Items</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs">
                    <tr>
                      <th className="px-4 py-2">Item</th>
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Qty</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {viewOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img src={item.productRef?.imageUrl || 'https://via.placeholder.com/40'} alt={item.productRef?.name} className="w-10 h-10 object-cover rounded border border-slate-200" />
                          <span className="font-medium text-slate-700">{item.productRef?.name || 'Unknown Product'}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">₹{item.price}</td>
                        <td className="px-4 py-3 text-slate-600">{item.qty}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800">₹{item.price * item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right font-bold text-slate-600">Total:</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800 text-lg">₹{viewOrder.total}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <button onClick={() => setViewOrder(null)} className="w-full py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
