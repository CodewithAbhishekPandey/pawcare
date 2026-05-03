import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  confirmed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  completed: 'bg-slate-600/40 text-slate-400 border-slate-600/40',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const ORDER_STATUS_STYLES = {
  placed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  processing: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const TABS = ['Appointments', 'Orders', 'Profile'];

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Appointments');
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingApts, setLoadingApts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    api.get('/appointments/me')
      .then((r) => setAppointments(r.data.data || []))
      .finally(() => setLoadingApts(false));

    api.get('/orders/me')
      .then((r) => setOrders(r.data.data || []))
      .finally(() => setLoadingOrders(false));

    api.get('/users/me').then((r) => {
      setName(r.data.data.name || '');
      setPhone(r.data.data.phone || '');
    }).catch(() => {});
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
    const res = await api.get('/appointments/me');
    setAppointments(res.data.data || []);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await api.patch('/users/me', { name, phone });
      setProfileMsg('✅ Profile updated successfully!');
    } catch {
      setProfileMsg('❌ Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const upcoming = appointments.filter((a) =>
    ['pending', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date()
  );
  const past = appointments.filter((a) => !upcoming.find((u) => u._id === a._id));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white">My Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name?.split(' ')[0]} 🐾</p>
        </div>
        <span className="px-4 py-2 bg-rose-500/15 border border-rose-500/25 text-rose-300 rounded-full text-sm font-medium capitalize">
          {user?.role?.replace('_', ' ')}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-1 mb-8 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === tab
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments Tab */}
      {activeTab === 'Appointments' && (
        <div>
          {loadingApts ? (
            <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-28 bg-slate-800/40 rounded-2xl animate-pulse" />)}</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">📅</p>
              <p className="text-white font-medium">No appointments yet</p>
              <Link to="/vets" className="mt-4 inline-block px-6 py-2.5 bg-rose-500 text-white font-bold rounded-xl">
                Find a Vet
              </Link>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Upcoming
                  </h2>
                  <div className="space-y-4">
                    {upcoming.map((apt) => (
                      <div key={apt._id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex flex-wrap gap-4 items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h3 className="font-bold text-white">{apt.clinicRef?.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold capitalize ${STATUS_STYLES[apt.status]}`}>{apt.status}</span>
                          </div>
                          <p className="text-slate-400 text-sm">{apt.clinicRef?.address}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-300">
                            <span>📅 {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            <span>🕐 {apt.timeSlot}</span>
                            <span>🐾 {apt.petName} ({apt.petType})</span>
                          </div>
                        </div>
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(apt._id)}
                            className="px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {past.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-slate-400 mb-4">Past</h2>
                  <div className="space-y-3">
                    {past.map((apt) => (
                      <div key={apt._id} className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-5 flex flex-wrap gap-4 items-start opacity-80">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h3 className="font-bold text-white">{apt.clinicRef?.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold capitalize ${STATUS_STYLES[apt.status]}`}>{apt.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <span>📅 {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span>🕐 {apt.timeSlot}</span>
                            <span>🐾 {apt.petName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'Orders' && (
        <div>
          {loadingOrders ? (
            <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-28 bg-slate-800/40 rounded-2xl animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">📦</p>
              <p className="text-white font-medium">No orders placed yet</p>
              <Link to="/shop" className="mt-4 inline-block px-6 py-2.5 bg-rose-500 text-white font-bold rounded-xl">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order._id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold capitalize ${ORDER_STATUS_STYLES[order.status] || ORDER_STATUS_STYLES.placed}`}>
                        {order.status}
                      </span>
                      <span className="text-lg font-black text-white">₹{order.total?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-slate-400">
                        <span>{item.productRef?.name || 'Product'} × {item.qty}</span>
                        <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  {order.address && (
                    <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700">📍 {order.address}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'Profile' && (
        <div className="max-w-md">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email (read-only)</label>
              <p className="px-4 py-3 bg-slate-700/50 rounded-xl text-slate-400 text-sm">{user?.email}</p>
            </div>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{profileMsg}</p>
            )}
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
            >
              {profileSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
