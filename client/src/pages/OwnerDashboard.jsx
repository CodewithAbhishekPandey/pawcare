import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-stone-100 text-stone-500 border-stone-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const ORDER_STATUS_STYLES = {
  placed: 'bg-sky-50 text-sky-700 border-sky-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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

  const inputCls = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-paw-teal focus:outline-none focus:ring-2 focus:ring-paw-teal/20 focus:border-paw-teal transition-all font-medium";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-serif font-black text-paw-teal">My Dashboard</h1>
          <p className="text-stone-500 mt-1 font-medium">Welcome back, {user?.name?.split(' ')[0]} 🐾</p>
        </div>
        <span className="px-4 py-2 bg-paw-teal/10 border border-paw-teal/20 text-paw-teal rounded-full text-sm font-bold capitalize">
          {user?.role?.replace('_', ' ')}
        </span>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link to="/vets" className="bg-white border border-stone-100 rounded-3xl p-4 text-center shadow-sm hover:shadow-md hover:border-paw-teal/30 transition-all group">
          <div className="text-3xl mb-2">🏥</div>
          <p className="text-xs font-bold text-paw-teal group-hover:text-paw-orange transition-colors">Book Vet</p>
        </Link>
        <Link to="/shop" className="bg-white border border-stone-100 rounded-3xl p-4 text-center shadow-sm hover:shadow-md hover:border-paw-teal/30 transition-all group">
          <div className="text-3xl mb-2">🛍️</div>
          <p className="text-xs font-bold text-paw-teal group-hover:text-paw-orange transition-colors">Pet Shop</p>
        </Link>
        <Link to="/instant-consult" className="bg-white border border-stone-100 rounded-3xl p-4 text-center shadow-sm hover:shadow-md hover:border-paw-teal/30 transition-all group">
          <div className="text-3xl mb-2">📹</div>
          <p className="text-xs font-bold text-paw-teal group-hover:text-paw-orange transition-colors">Consult</p>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-2xl p-1 mb-8 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab
                ? 'bg-white text-paw-teal shadow-sm'
                : 'text-stone-400 hover:text-paw-teal'
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
            <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-28 bg-stone-100 rounded-3xl animate-pulse" />)}</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">📅</p>
              <p className="text-paw-teal font-bold mb-2">No appointments yet</p>
              <Link to="/vets" className="mt-4 inline-block px-6 py-2.5 bg-paw-teal text-white font-bold rounded-full shadow-md">
                Find a Vet
              </Link>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-paw-teal mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Upcoming
                  </h2>
                  <div className="space-y-4">
                    {upcoming.map((apt) => (
                      <div key={apt._id} className="bg-white border border-stone-100 rounded-3xl p-5 flex flex-wrap gap-4 items-start shadow-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h3 className="font-bold text-paw-teal">{apt.clinicRef?.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-bold capitalize ${STATUS_STYLES[apt.status]}`}>{apt.status}</span>
                          </div>
                          <p className="text-stone-400 text-sm">{apt.clinicRef?.address}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-stone-600 font-medium">
                            <span>📅 {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            <span>🕐 {apt.timeSlot}</span>
                            <span>🐾 {apt.petName} ({apt.petType})</span>
                          </div>
                        </div>
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(apt._id)}
                            className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-2xl text-sm font-bold transition-colors"
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
                  <h2 className="text-lg font-bold text-stone-400 mb-4">Past</h2>
                  <div className="space-y-3">
                    {past.map((apt) => (
                      <div key={apt._id} className="bg-stone-50 border border-stone-100 rounded-3xl p-5 flex flex-wrap gap-4 items-start opacity-80">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h3 className="font-bold text-paw-teal">{apt.clinicRef?.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-bold capitalize ${STATUS_STYLES[apt.status]}`}>{apt.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-stone-400 font-medium">
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
            <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-28 bg-stone-100 rounded-3xl animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">📦</p>
              <p className="text-paw-teal font-bold mb-2">No orders placed yet</p>
              <Link to="/shop" className="mt-4 inline-block px-6 py-2.5 bg-paw-teal text-white font-bold rounded-full shadow-md">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order._id} className="bg-white border border-stone-100 rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div>
                      <p className="text-xs text-stone-400 font-semibold">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-bold capitalize ${ORDER_STATUS_STYLES[order.status] || ORDER_STATUS_STYLES.placed}`}>
                        {order.status}
                      </span>
                      <span className="text-lg font-black text-paw-teal">₹{order.total?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-stone-500 font-medium">
                        <span>{item.productRef?.name || 'Product'} × {item.qty}</span>
                        <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  {order.address && (
                    <p className="text-xs text-stone-400 mt-3 pt-3 border-t border-stone-100">📍 {order.address}</p>
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
          <div className="bg-white border border-stone-100 rounded-3xl p-6 space-y-5 shadow-sm">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-400 mb-1">Email (read-only)</label>
              <p className="px-4 py-3 bg-stone-50 rounded-2xl text-stone-400 text-sm border border-stone-100">{user?.email}</p>
            </div>
            {profileMsg && (
              <p className={`text-sm font-medium ${profileMsg.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>{profileMsg}</p>
            )}
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="w-full py-3 bg-paw-teal hover:bg-opacity-90 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-md"
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
