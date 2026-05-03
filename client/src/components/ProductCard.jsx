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
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 group flex flex-col">
      {/* Image / Placeholder */}
      <div className="h-44 bg-slate-700/50 flex items-center justify-center overflow-hidden relative">
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
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Only {product.stock} left!
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-1">
          <span className="text-xs px-2 py-0.5 bg-rose-500/15 border border-rose-500/20 text-rose-300 rounded-full font-medium capitalize">
            {product.category}
          </span>
        </div>
        <h3 className="font-bold text-white text-base mt-2 group-hover:text-rose-400 transition-colors line-clamp-2 flex-1">
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-slate-500 text-xs mt-0.5">{product.brand}</p>
        )}
        {product.description && (
          <p className="text-slate-400 text-sm mt-2 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
          <span className="text-xl font-bold text-white">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {product.stock === 0 ? 'Sold Out' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
