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
    if (!address.trim()) { setError('Please enter a delivery address.'); return; }
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
        <h2 className="text-3xl font-black text-paw-teal mb-3">Order Placed!</h2>
        <p className="text-stone-500 mb-2">Your order has been received and is being processed.</p>
        <p className="text-xs text-stone-400 mb-8">Order ID: {orderId.slice(-10).toUpperCase()}</p>
        <div className="flex gap-4 justify-center">
          <Link to="/shop" className="px-6 py-3 bg-white border border-stone-200 hover:border-paw-teal text-paw-teal font-semibold rounded-full transition-all">
            Continue Shopping
          </Link>
          <Link to="/orders" className="px-6 py-3 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-full transition-all">
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
        <h2 className="text-2xl font-bold text-paw-teal mb-3">Your cart is empty</h2>
        <p className="text-stone-500 mb-8">Browse our pet shop to add products.</p>
        <Link to="/shop" className="px-6 py-3 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-full transition-all shadow-md">
          Go to Shop →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-serif font-black text-paw-teal mb-8">Your Cart 🛒</h1>

      {/* Items list */}
      <div className="space-y-4 mb-6">
        {items.map(({ product, qty }) => (
          <div key={product._id} className="bg-white border border-stone-100 rounded-3xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
                : CATEGORY_EMOJI[product.category] || '📦'
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-paw-teal font-bold truncate">{product.name}</p>
              <p className="text-paw-orange font-bold text-sm">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => updateQty(product._id, qty - 1)}
                className="w-8 h-8 bg-stone-100 hover:bg-stone-200 rounded-xl text-paw-teal font-bold text-sm transition-colors"
              >−</button>
              <span className="text-paw-teal w-6 text-center font-bold">{qty}</span>
              <button
                onClick={() => updateQty(product._id, qty + 1)}
                className="w-8 h-8 bg-stone-100 hover:bg-stone-200 rounded-xl text-paw-teal font-bold text-sm transition-colors"
              >+</button>
            </div>
            <div className="text-right flex-shrink-0 min-w-[80px]">
              <p className="text-paw-teal font-bold">₹{(product.price * qty).toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={() => removeFromCart(product._id)}
              className="text-stone-300 hover:text-paw-orange text-xl transition-colors"
            >×</button>
          </div>
        ))}
      </div>

      {/* Order total */}
      <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <span className="text-stone-500 font-medium">Order Total</span>
          <span className="text-3xl font-black text-paw-teal">₹{totalPrice.toLocaleString('en-IN')}</span>
        </div>

        {!user ? (
          <Link
            to="/login"
            className="block text-center w-full py-3 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-full shadow-lg transition-all"
          >
            Login to Place Order →
          </Link>
        ) : (
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full py-3 bg-paw-teal hover:bg-opacity-90 text-white font-bold rounded-full shadow-lg shadow-paw-teal/20 transition-all"
          >
            Proceed to Checkout →
          </button>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-stone-100">
            <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 text-stone-400 hover:text-paw-teal text-2xl transition-colors">✕</button>
            <h3 className="text-2xl font-black text-paw-teal mb-6">Confirm Order</h3>

            {/* Item summary */}
            <div className="bg-stone-50 rounded-2xl p-4 max-h-36 overflow-y-auto space-y-2 mb-5 border border-stone-100">
              {items.map(({ product, qty }) => (
                <div key={product._id} className="flex justify-between text-sm">
                  <span className="text-stone-600">{product.name} × {qty}</span>
                  <span className="text-paw-teal font-bold">₹{(product.price * qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold">
                <span className="text-stone-700">Total</span>
                <span className="text-paw-orange">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-stone-700 mb-2">Delivery Address *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                rows={3}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-paw-teal placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-paw-teal/20 focus:border-paw-teal resize-none transition-all"
              />
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm font-medium">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={!address.trim() || loading}
                className="flex-1 py-3 bg-paw-teal disabled:opacity-60 text-white font-bold rounded-2xl transition-all hover:bg-opacity-90"
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
