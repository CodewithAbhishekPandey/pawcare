import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageDeliveryAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedAgentId, setExpandedAgentId] = useState(null);
  const [agentOrders, setAgentOrders] = useState([]);

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', vehicleType: 'bike', area: ''
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/admin/delivery-agents');
      if (res.data.success) {
        setAgents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching delivery agents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/delivery-agents', formData);
      setShowAddModal(false);
      setFormData({ name: '', phone: '', email: '', vehicleType: 'bike', area: '' });
      fetchAgents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add agent');
    }
  };

  const toggleAgentStatus = async (id) => {
    try {
      await api.patch(`/admin/delivery-agents/${id}/toggle`);
      fetchAgents();
    } catch (err) {
      alert('Failed to update agent status');
    }
  };

  const deleteAgent = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this agent?')) return;
    try {
      await api.delete(`/admin/delivery-agents/${id}`);
      fetchAgents();
    } catch (err) {
      alert('Failed to delete agent');
    }
  };

  const toggleRow = async (agentId) => {
    if (expandedAgentId === agentId) {
      setExpandedAgentId(null);
      setAgentOrders([]);
    } else {
      setExpandedAgentId(agentId);
      try {
        const res = await api.get(`/admin/orders/by-agent/${agentId}`);
        setAgentOrders(res.data.data);
      } catch (err) {
        console.error('Failed to fetch agent orders', err);
      }
    }
  };

  const totalDeliveriesToday = agents.reduce((acc, a) => acc + a.totalDeliveries, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Agents</p>
          <p className="text-2xl font-bold text-slate-800">{agents.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Active Agents</p>
          <p className="text-2xl font-bold text-[#1D9E75]">{agents.filter(a => a.isActive).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Lifetime Deliveries</p>
          <p className="text-2xl font-bold text-slate-800">{totalDeliveriesToday}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Delivery Agents</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-bold rounded-lg hover:bg-[#168a65] transition-colors"
          >
            + Add Agent
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Name & Contact</th>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">Area</th>
                <th className="px-6 py-4 font-semibold">Deliveries</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-slate-500">Loading...</td></tr>
              ) : agents.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-slate-500">No delivery agents found.</td></tr>
              ) : (
                agents.map((agent) => (
                  <React.Fragment key={agent._id}>
                    <tr className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleRow(agent._id)}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.phone} {agent.email && `• ${agent.email}`}</p>
                      </td>
                      <td className="px-6 py-4 capitalize text-sm text-slate-600">
                        {agent.vehicleType}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {agent.area || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                        {agent.totalDeliveries}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleAgentStatus(agent._id); }}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${agent.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={(e) => { e.stopPropagation(); deleteAgent(agent._id); }} className="text-red-600 hover:text-red-800 text-sm font-medium">Deactivate</button>
                      </td>
                    </tr>
                    {expandedAgentId === agent._id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="6" className="px-6 py-4">
                          <h4 className="font-bold text-slate-700 mb-2 text-sm">Assigned Orders ({agentOrders.length})</h4>
                          {agentOrders.length === 0 ? (
                            <p className="text-xs text-slate-500">No orders currently assigned to this agent.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {agentOrders.map(o => (
                                <div key={o._id} className="bg-white p-3 border border-slate-200 rounded text-sm flex justify-between items-center">
                                  <div>
                                    <span className="font-medium">#{o._id.toString().slice(-6).toUpperCase()}</span>
                                    <span className="ml-2 text-xs text-slate-500">{o.userRef?.name}</span>
                                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{o.address}</p>
                                  </div>
                                  <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Delivery Agent</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none">
                  <option value="bike">Bike</option>
                  <option value="cycle">Cycle</option>
                  <option value="auto">Auto</option>
                  <option value="car">Car</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Operating Area</label>
                <input type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} placeholder="e.g. DLF Phase 1-3" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2 text-white bg-[#1D9E75] hover:bg-[#168a65] rounded-lg font-bold">Save Agent</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDeliveryAgents;
