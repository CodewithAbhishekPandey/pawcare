import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const ORDER_STATUS_STYLES = {
  pending: 'bg-amber-50 border-amber-200 text-amber-700',
  processing: 'bg-sky-50 border-sky-200 text-sky-700',
  shipped: 'bg-purple-50 border-purple-200 text-purple-700',
  delivered: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  cancelled: 'bg-red-50 border-red-200 text-red-600',
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
      .then((res) => setOrders(res.data.data || res.data))
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
      { id: 'placed', label: 'Placed' },
      { id: 'processing', label: 'Processing' },
      { id: 'out', label: 'Out for Delivery' },
      { id: 'delivered', label: 'Delivered' }
    ];
    let activeIdx = 0;
    if (status === 'processing') activeIdx = 1;
    if (status === 'delivered') activeIdx = 3;
    if (status === 'cancelled') activeIdx = -1;
    return { steps, activeIdx };
  };

  if (!user) {
    return (
      <div className="text-center mt-20">
        <p className="text-5xl mb-4">🔒</p>
        <p className="text-paw-teal font-bold text-lg mb-4">Please log in to view your orders.</p>
        <Link to="/login" className="px-6 py-3 bg-paw-teal text-white rounded-full font-bold shadow-md">Login</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-black text-paw-teal mb-1">My Orders 📦</h1>
        <p className="text-stone-500 font-medium">Track your deliveries</p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-36 bg-stone-100 rounded-3xl animate-pulse" />)}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-xl font-bold text-paw-teal mb-2">No orders yet</p>
          <p className="text-stone-500 text-sm mb-6">Head to the shop to buy something great</p>
          <Link to="/shop" className="px-6 py-3 bg-paw-teal text-white rounded-full font-bold shadow-md">Go to Shop</Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-stone-400 font-mono mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-stone-400 text-sm">
                    📅 {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {order.status === 'placed' && !order.isCancelled && (
                    <button
                      onClick={() => setCancelModal({ show: true, orderId: order._id, reason: '' })}
                      className="px-3 py-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-full border border-red-200 text-xs font-bold transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  <span className={`text-xs px-3 py-1 border rounded-full font-bold capitalize ${order.isCancelled ? ORDER_STATUS_STYLES.cancelled : ORDER_STATUS_STYLES[order.status]}`}>
                    {order.isCancelled ? 'Cancelled' : order.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm font-medium">
                    <span className="text-stone-600">{item.productRef?.name || 'Product'} × {item.qty}</span>
                    <span className="text-paw-teal font-bold">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center py-4 border-t border-stone-100">
                <p className="text-stone-400 text-xs">📍 {order.address}</p>
                <p className="text-lg font-black text-paw-teal">₹{order.total.toLocaleString('en-IN')}</p>
              </div>

              {/* Timeline */}
              {!order.isCancelled && (
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                  {getTimelineSteps(order.status).steps.map((step, idx) => {
                    const { activeIdx } = getTimelineSteps(order.status);
                    const isCompleted = idx <= activeIdx;
                    return (
                      <div key={step.id} className="flex flex-col items-center relative z-10">
                        <div className={`w-4 h-4 rounded-full border-2 mb-1 transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-stone-200'}`}></div>
                        <p className={`text-[10px] sm:text-xs font-bold ${isCompleted ? 'text-emerald-600' : 'text-stone-300'}`}>{step.label}</p>
                        {idx < 3 && (
                          <div className={`absolute top-2 left-1/2 w-[20vw] sm:w-24 h-0.5 -z-10 ${idx < activeIdx ? 'bg-emerald-500' : 'bg-stone-100'}`}></div>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-100 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black text-paw-teal mb-2">Cancel this order?</h3>
            <p className="text-sm text-stone-500 mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <textarea
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-paw-teal text-sm focus:outline-none focus:border-paw-teal mb-6 resize-none font-medium"
              placeholder="Reason (optional)"
              rows="3"
              value={cancelModal.reason}
              onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
            ></textarea>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ show: false, orderId: null, reason: '' })}
                className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl font-bold transition-colors"
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelSubmit}
                className="flex-1 px-4 py-2.5 bg-paw-orange hover:bg-opacity-90 text-white rounded-2xl font-bold transition-colors disabled:opacity-50"
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
