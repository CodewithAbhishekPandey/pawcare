import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CATEGORY_EMOJI = { food: '🍖', medicine: '💊', accessory: '🎀', toy: '🎾' };

const Cart = () => {
  const { user } = useAuth();
  const { items, removeFromCart, updateQty, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  const handlePlaceOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({ productRef: i.product._id, qty: i.qty })),
        address,
      });
      setOrderId(res.data.data._id);
      clearCart();
      setShowCheckout(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-7xl mb-6">🎉</div>
        <h2 className="text-3xl font-black text-white mb-3">Order Placed!</h2>
        <p className="text-slate-400 mb-2">Your order has been received and is being processed.</p>
        <p className="text-xs text-slate-500 mb-8">Order ID: {orderId.slice(-10).toUpperCase()}</p>
        <div className="flex gap-4 justify-center">
          <Link to="/shop" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors">
            Continue Shopping
          </Link>
          <Link to="/dashboard" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors">
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
        <p className="text-slate-400 mb-8">Browse our pet shop to add products.</p>
        <Link to="/shop" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors">
          Go to Shop →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white mb-8">Your Cart</h1>

      {/* Items list */}
      <div className="space-y-4 mb-6">
        {items.map(({ product, qty }) => (
          <div key={product._id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-700/50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                : CATEGORY_EMOJI[product.category] || '📦'
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{product.name}</p>
              <p className="text-rose-400 font-bold text-sm">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => updateQty(product._id, qty - 1)}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-sm transition-colors"
              >−</button>
              <span className="text-white w-6 text-center font-medium">{qty}</span>
              <button
                onClick={() => updateQty(product._id, qty + 1)}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-sm transition-colors"
              >+</button>
            </div>
            <div className="text-right flex-shrink-0 min-w-[80px]">
              <p className="text-white font-bold">₹{(product.price * qty).toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={() => removeFromCart(product._id)}
              className="text-slate-500 hover:text-red-400 text-xl transition-colors"
            >×</button>
          </div>
        ))}
      </div>

      {/* Order total */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-slate-300 font-medium">Order Total</span>
          <span className="text-3xl font-black text-white">₹{totalPrice.toLocaleString('en-IN')}</span>
        </div>

        {!user ? (
          <Link
            to="/login"
            className="block text-center w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold rounded-xl shadow-lg"
          >
            Login to Place Order →
          </Link>
        ) : (
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all"
          >
            Proceed to Checkout →
          </button>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl">✕</button>
            <h3 className="text-2xl font-bold text-white mb-6">Confirm Order</h3>

            {/* Item summary */}
            <div className="bg-slate-800 rounded-xl p-4 max-h-36 overflow-y-auto space-y-2 mb-5">
              {items.map(({ product, qty }) => (
                <div key={product._id} className="flex justify-between text-sm">
                  <span className="text-slate-300">{product.name} × {qty}</span>
                  <span className="text-white font-medium">₹{(product.price * qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-700 flex justify-between font-bold">
                <span className="text-slate-200">Total</span>
                <span className="text-rose-400">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">Delivery Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address in Gurugram..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={!address.trim() || loading}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-orange-500 disabled:opacity-60 text-white font-bold rounded-xl transition-all"
              >
                {loading ? 'Placing…' : 'Place Order ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
