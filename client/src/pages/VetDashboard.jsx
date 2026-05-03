import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const STATUS_STYLES = {
  pending: { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Pending' },
  confirmed: { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Confirmed' },
  completed: { cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Completed' },
  cancelled: { cls: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Cancelled' },
};

const isSameDay = (d1, d2) => {
  const a = new Date(d1);
  const b = new Date(d2);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

const VetDashboard = () => {
  const { user, setUser } = useAuth();
  const { socket } = useSocket();
  const [clinic, setClinic] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(null);

  // Online/Offline toggle state
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [togglingOnline, setTogglingOnline] = useState(false);

  // Teleconsult stats
  const [consultStats, setConsultStats] = useState({ todayEarnings: 0, completedToday: 0, totalEarnings: 0 });

  // Consult fee edit
  const [consultFee, setConsultFee] = useState(user?.consultFee || 500);
  const [editingFee, setEditingFee] = useState(false);
  const [savingFee, setSavingFee] = useState(false);

  useEffect(() => {
    // Fetch clinic + appointments
    api.get('/vets/mine')
      .then((r) => {
        setClinic(r.data.data);
        return api.get(`/appointments/clinic/${r.data.data._id}`);
      })
      .then((r) => setAppointments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch teleconsult stats
    api.get('/consult/vet-sessions')
      .then((r) => {
        const d = r.data.data;
        setConsultStats({
          todayEarnings: d.todayEarnings || 0,
          completedToday: d.completedToday || 0,
          totalEarnings: user?.totalEarnings || 0,
        });
      })
      .catch(() => {});
  }, []);

  const refresh = async (clinicId) => {
    const r = await api.get(`/appointments/clinic/${clinicId}`);
    setAppointments(r.data.data || []);
  };

  const handleStatus = async (aptId, newStatus) => {
    setUpdating(aptId);
    try {
      await api.patch(`/appointments/${aptId}/status`, { status: newStatus });
      if (clinic) await refresh(clinic._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    try {
      const newStatus = !isOnline;
      const { data } = await api.patch('/users/me/online-status', { isOnline: newStatus });
      setIsOnline(newStatus);

      // Also emit via socket for immediate effect
      if (socket) {
        if (newStatus) {
          socket.emit('vet_go_online', {
            vetId: user._id || user.id,
            vetInfo: {
              name: user.name,
              consultFee: consultFee,
              specializations: user.specializations || [],
              rating: user.rating || 0,
              totalRatings: user.totalRatings || 0,
            },
          });
        } else {
          socket.emit('vet_go_offline', { vetId: user._id || user.id });
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleSaveFee = async () => {
    setSavingFee(true);
    try {
      await api.patch('/users/me/consult-fee', { consultFee: Number(consultFee) });
      setEditingFee(false);
    } catch (err) {
      alert('Failed to update fee');
    } finally {
      setSavingFee(false);
    }
  };

  const today = appointments.filter((a) => isSameDay(a.date, new Date()));
  const todaySorted = [...today].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  const thisWeek = appointments.filter((a) => {
    const d = new Date(a.date);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return d >= start && d <= end;
  });

  const stats = {
    week: thisWeek.length,
    pending: thisWeek.filter((a) => a.status === 'pending').length,
    confirmed: thisWeek.filter((a) => a.status === 'confirmed').length,
    completed: thisWeek.filter((a) => a.status === 'completed').length,
  };

  const filteredAll = filterStatus === 'all' ? appointments : appointments.filter((a) => a.status === filterStatus);

  const AppCard = ({ apt }) => (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold capitalize ${STATUS_STYLES[apt.status]?.cls}`}>
              {STATUS_STYLES[apt.status]?.label}
            </span>
            {apt.type === 'scheduled_online' && (
              <span className="text-xs px-2.5 py-1 rounded-full border font-semibold bg-sky-500/20 text-sky-300 border-sky-500/30">
                📹 Online
              </span>
            )}
            <span className="text-slate-400 text-sm">🕐 {apt.timeSlot}</span>
            <span className="text-slate-400 text-sm">📅 {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
          <p className="text-white font-bold">🐾 {apt.petName} ({apt.petType})</p>
          <p className="text-slate-400 text-sm">{apt.petOwnerRef?.name} · {apt.petOwnerRef?.phone || apt.petOwnerRef?.email}</p>
          {apt.notes && <p className="text-slate-500 text-xs mt-1 italic">{apt.notes}</p>}
          {apt.type === 'scheduled_online' && apt.status === 'confirmed' && apt.meetLink && (
            <a
              href={apt.meetLink}
              className="inline-flex items-center gap-1.5 mt-2 text-xs px-3 py-1 bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:bg-sky-500/30 rounded-lg transition-colors"
            >
              📹 Join Video Call
            </a>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {apt.status === 'pending' && (
            <button
              disabled={updating === apt._id}
              onClick={() => handleStatus(apt._id, 'confirmed')}
              className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/40 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              ✓ Confirm
            </button>
          )}
          {apt.status === 'confirmed' && (
            <button
              disabled={updating === apt._id}
              onClick={() => handleStatus(apt._id, 'completed')}
              className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/40 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              ✓ Complete
            </button>
          )}
          {['pending', 'confirmed'].includes(apt.status) && (
            <button
              disabled={updating === apt._id}
              onClick={() => handleStatus(apt._id, 'cancelled')}
              className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/40 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              ✕ Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-slate-800/40 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Vet Dashboard</h1>
          <p className="text-slate-400 mt-1">{clinic?.name || 'Your Clinic'}</p>
        </div>
        <span className="px-4 py-2 bg-purple-500/15 border border-purple-500/25 text-purple-300 rounded-full text-sm font-medium">
          Veterinarian
        </span>
      </div>

      {/* ── Online Availability Toggle ───────────────────────────────── */}
      <div className={`rounded-3xl border p-6 transition-all duration-500 ${isOnline
        ? 'bg-emerald-500/10 border-emerald-500/30'
        : 'bg-slate-800/60 border-slate-700/50'
      }`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isOnline ? 'bg-emerald-500/20' : 'bg-slate-700/60'}`}>
              {isOnline ? '🟢' : '⚫'}
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">
                Online Availability
                <span className={`ml-3 px-3 py-0.5 rounded-full text-sm font-semibold ${isOnline
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-700/60 text-slate-400 border border-slate-600/50'
                }`}>
                  {isOnline ? '🟢 Online' : '⚫ Offline'}
                </span>
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {isOnline
                  ? 'You are visible to pet owners for instant consultations'
                  : 'Toggle online to accept instant video consultations'}
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            id="vet-online-toggle"
            onClick={handleToggleOnline}
            disabled={togglingOnline}
            aria-label="Toggle online status"
            className={`relative w-20 h-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 ${isOnline ? 'bg-emerald-500' : 'bg-slate-600'}`}
          >
            <span
              className={`absolute top-1 w-8 h-8 rounded-full bg-white shadow-md transition-all duration-300 ${isOnline ? 'left-11' : 'left-1'}`}
            />
            {togglingOnline && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              </span>
            )}
          </button>
        </div>

        {/* Consultation fee */}
        {isOnline && (
          <div className="mt-5 pt-5 border-t border-emerald-500/20 flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 text-sm">Your consultation fee:</span>
            {editingFee ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">₹</span>
                <input
                  type="number"
                  value={consultFee}
                  onChange={(e) => setConsultFee(e.target.value)}
                  className="w-28 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500/70"
                  min="100"
                  max="5000"
                />
                <button
                  onClick={handleSaveFee}
                  disabled={savingFee}
                  className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {savingFee ? '...' : 'Save'}
                </button>
                <button onClick={() => setEditingFee(false)} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold text-lg">₹{consultFee}</span>
                <button
                  onClick={() => setEditingFee(true)}
                  className="text-slate-500 hover:text-slate-300 text-xs underline transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Teleconsult Earnings ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-emerald-400 mb-1">₹{consultStats.todayEarnings.toLocaleString('en-IN')}</p>
          <p className="text-slate-400 text-sm">Today's Earnings</p>
          <p className="text-slate-600 text-xs mt-0.5">Teleconsult</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-sky-400 mb-1">{consultStats.completedToday}</p>
          <p className="text-slate-400 text-sm">Sessions Today</p>
          <p className="text-slate-600 text-xs mt-0.5">Completed</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-amber-400 mb-1">₹{(user?.totalEarnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-slate-400 text-sm">Lifetime Earnings</p>
          <p className="text-slate-600 text-xs mt-0.5">All time</p>
        </div>
      </div>

      {/* ── In-Person Appointment Stats ──────────────────────────────── */}
      <div>
        <h2 className="text-white font-bold text-xl mb-4">In-Person Appointments</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'This Week', value: stats.week, color: 'text-white' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-400' },
            { label: 'Completed', value: stats.completed, color: 'text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-center">
              <p className={`text-3xl font-black mb-1 ${color}`}>{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-1 mb-5 w-fit">
          {['today', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all capitalize ${activeTab === tab ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              {tab === 'today' ? "Today's Schedule" : 'All Appointments'}
            </button>
          ))}
        </div>

        {activeTab === 'today' && (
          <div>
            {todaySorted.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">☀️</p>
                <p className="text-white font-medium">No appointments today</p>
                <p className="text-slate-400 text-sm mt-1">Enjoy your free day!</p>
              </div>
            ) : (
              <div className="space-y-4">{todaySorted.map((apt) => <AppCard key={apt._id} apt={apt} />)}</div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${filterStatus === s ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {filteredAll.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No appointments found</div>
            ) : (
              <div className="space-y-4">{filteredAll.map((apt) => <AppCard key={apt._id} apt={apt} />)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VetDashboard;
