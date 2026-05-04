import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { key: 'all', label: 'All Products', emoji: '🛍️' },
  { key: 'food', label: 'Pet Food', emoji: '🍖' },
  { key: 'medicine', label: 'Medicine', emoji: '💊' },
  { key: 'accessory', label: 'Accessories', emoji: '🎀' },
  { key: 'toy', label: 'Toys', emoji: '🎾' },
];

const Shop = () => {
  const { totalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  const fetchProducts = async (cat) => {
    setLoading(true);
    try {
      const params = cat !== 'all' ? `?category=${cat}` : '';
      const res = await api.get(`/products${params}`);
      setProducts(res.data.data?.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(category); }, [category]);

  return (
    <div className="bg-paw-cream min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-serif font-black text-paw-teal mb-1">Pet Shop 🛍️</h1>
          <p className="text-stone-500 font-medium">Premium products for your furry family</p>
        </div>
        <Link
          to="/cart"
          className="relative flex items-center gap-2 px-5 py-2.5 bg-paw-teal hover:bg-opacity-90 text-white font-semibold rounded-full text-sm transition-all shadow-md"
        >
          🛒 Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-paw-orange text-white text-xs font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {CATEGORIES.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm border ${
              category === key
                ? 'bg-paw-teal text-white border-paw-teal shadow-paw-teal/20'
                : 'bg-white text-stone-600 border-stone-200 hover:border-paw-teal hover:text-paw-teal'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="h-80 bg-stone-100 rounded-3xl animate-pulse" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20 text-stone-400">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-xl font-bold text-paw-teal">No products in this category</p>
          <p className="text-sm mt-2 text-stone-500">Check back soon — we're stocking up!</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Shop;
