import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const ORDER_STATUS_STYLES = {
  pending: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
  processing: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  shipped: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
  delivered: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  cancelled: 'bg-red-500/20 border-red-500/30 text-red-300',
};

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ show: false, orderId: null, reason: '' });
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders/me')
      .then((res) => setOrders(res.data.data || res.data)) // Handle {success:true, data:[]} wrapper
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  const handleCancelSubmit = async () => {
    setCancelling(true);
    try {
      await api.post(`/orders/${cancelModal.orderId}/cancel`, { reason: cancelModal.reason });
      alert('Order cancelled successfully.');
      setCancelModal({ show: false, orderId: null, reason: '' });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getTimelineSteps = (status) => {
    const steps = [
      { id: 'placed', label: 'Order Placed' },
      { id: 'processing', label: 'Processing' },
      { id: 'out', label: 'Out for Delivery' },
      { id: 'delivered', label: 'Delivered' }
    ];
    let activeIdx = 0;
    if (status === 'processing') activeIdx = 1;
    if (status === 'delivered') activeIdx = 3;
    // Assuming out for delivery is when agent is assigned and status is processing, but we'll simplify
    if (status === 'processing') activeIdx = 2; // Let's just say processing means out for delivery for simplicity if agent is assigned. Actually, let's stick to status.
    if (status === 'delivered') activeIdx = 3;
    
    // Better logic:
    if (status === 'placed') activeIdx = 0;
    else if (status === 'processing') activeIdx = 1;
    else if (status === 'delivered') activeIdx = 3;
    else if (status === 'cancelled') activeIdx = -1;

    return { steps, activeIdx };
  };

  if (!user) {
    return (
      <div className="text-center mt-20">
        <p className="text-slate-400 text-lg mb-4">Please log in to view your orders.</p>
        <Link to="/login" className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold">Login</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold text-white mb-1">My Orders</h2>
        <p className="text-slate-400">Track your deliveries</p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-36 bg-slate-800/40 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-xl font-medium text-white mb-2">No orders yet</p>
          <p className="text-slate-500 text-sm mb-6">Head to the shop to buy something great</p>
          <Link to="/shop" className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold">Go to Shop</Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-slate-500 font-mono mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-slate-400 text-sm">
                    📅 {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {order.status === 'placed' && !order.isCancelled && (
                    <button
                      onClick={() => setCancelModal({ show: true, orderId: order._id, reason: '' })}
                      className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded border border-red-500/30 text-xs font-bold transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  <span className={`text-xs px-3 py-1 border rounded-full font-medium capitalize ${order.isCancelled ? ORDER_STATUS_STYLES.cancelled : ORDER_STATUS_STYLES[order.status]}`}>
                    {order.isCancelled ? 'Cancelled' : order.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-300">{item.productRef?.name || 'Product'} × {item.qty}</span>
                    <span className="text-white">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center py-4 border-t border-slate-700">
                <p className="text-slate-400 text-xs">📍 {order.address}</p>
                <p className="text-lg font-bold text-white">₹{order.total.toLocaleString('en-IN')}</p>
              </div>

              {/* Delivery Agent Section */}
              {order.assignedAgent && !order.isCancelled && order.status !== 'delivered' && (
                <div className="mt-2 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">🛵 Your delivery agent</p>
                    <p className="text-sm font-bold text-white">{order.assignedAgent.name}</p>
                    <a href={`tel:${order.assignedAgent.phone}`} className="text-xs text-blue-400 hover:underline">📞 {order.assignedAgent.phone}</a>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium mb-1">Est. Delivery</p>
                      <p className="text-sm font-bold text-emerald-400">{new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              {!order.isCancelled && (
                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                  {getTimelineSteps(order.status).steps.map((step, idx) => {
                    const { activeIdx } = getTimelineSteps(order.status);
                    const isCompleted = idx <= activeIdx;
                    return (
                      <div key={step.id} className="flex flex-col items-center relative z-10">
                        <div className={`w-4 h-4 rounded-full border-2 mb-1 ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-600'}`}></div>
                        <p className={`text-[10px] sm:text-xs font-medium ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>{step.label}</p>
                        {idx < 3 && (
                          <div className={`absolute top-2 left-1/2 w-[20vw] sm:w-24 h-0.5 -z-10 ${idx < activeIdx ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Cancel this order?</h3>
            <p className="text-sm text-slate-400 mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-500 mb-6"
              placeholder="Reason (optional)"
              rows="3"
              value={cancelModal.reason}
              onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
            ></textarea>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ show: false, orderId: null, reason: '' })}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelSubmit}
                className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
