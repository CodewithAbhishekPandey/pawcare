import React from 'react';
import { useCart } from '../context/CartContext';

const CATEGORY_EMOJI = {
  food: '🍖',
  medicine: '💊',
  accessory: '🎀',
  toy: '🎾',
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white border border-stone-100 rounded-3xl overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-300 group flex flex-col shadow-sm">
      {/* Image / Placeholder */}
      <div className="h-44 bg-stone-50 flex items-center justify-center overflow-hidden relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-6xl">{CATEGORY_EMOJI[product.category] || '📦'}</span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            Only {product.stock} left!
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 right-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-1">
          <span className="text-xs px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full font-bold capitalize tracking-wide">
            {product.category}
          </span>
        </div>
        <h3 className="font-extrabold text-slate-800 text-base mt-3 group-hover:text-emerald-700 transition-colors line-clamp-2 flex-1">
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-slate-500 font-medium text-xs mt-1">{product.brand}</p>
        )}
        {product.description && (
          <p className="text-slate-400 text-sm mt-2 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-100">
          <span className="text-xl font-black text-slate-800">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm transition-all shadow-sm active:scale-95"
          >
            {product.stock === 0 ? 'Sold Out' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
