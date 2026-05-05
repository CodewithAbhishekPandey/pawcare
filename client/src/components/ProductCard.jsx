import React from 'react';
import { useCart } from '../context/CartContext';

const CATEGORY_EMOJI = {
  food: '🍖',
  medicine: '💊',
  accessory: '🎀',
  toy: '🎾',
};

const CATEGORY_COLORS = {
  food: 'bg-amber-50 border-amber-100 text-amber-700',
  medicine: 'bg-sky-50 border-sky-100 text-sky-700',
  accessory: 'bg-purple-50 border-purple-100 text-purple-700',
  toy: 'bg-emerald-50 border-emerald-100 text-emerald-700',
};

const ProductCard = ({ product }) => {
  const { addToCart, items } = useCart();

  const cartItem = items.find((i) => i.product._id === product._id);
  const inCart = cartItem ? cartItem.qty : 0;

  return (
    <div className="bg-white border border-stone-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-paw-teal/5 hover:border-paw-teal/30 transition-all duration-300 group flex flex-col shadow-sm">
      {/* Image / Placeholder */}
      <div className="h-44 bg-stone-50 flex items-center justify-center overflow-hidden relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {CATEGORY_EMOJI[product.category] || '📦'}
          </span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            Only {product.stock} left!
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 right-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            Out of stock
          </span>
        )}
        {inCart > 0 && (
          <span className="absolute top-3 left-3 bg-paw-teal text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            ×{inCart} in cart
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold capitalize border ${CATEGORY_COLORS[product.category] || 'bg-stone-50 border-stone-200 text-stone-600'}`}>
            {CATEGORY_EMOJI[product.category]} {product.category}
          </span>
        </div>
        <h3 className="font-bold text-paw-teal text-base mt-2 group-hover:text-paw-orange transition-colors line-clamp-2 flex-1">
          {product.name}
        </h3>
        {product.brand && (
          <p className="text-stone-400 font-medium text-xs mt-1">{product.brand}</p>
        )}
        {product.description && (
          <p className="text-stone-400 text-sm mt-2 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-stone-100">
          <span className="text-xl font-black text-paw-teal">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={`px-5 py-2.5 font-bold rounded-2xl text-sm transition-all shadow-sm active:scale-95 ${
              product.stock === 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                : inCart > 0
                ? 'bg-paw-orange hover:bg-opacity-90 text-white shadow-paw-orange/20'
                : 'bg-paw-teal hover:bg-opacity-90 text-white shadow-paw-teal/20'
            }`}
          >
            {product.stock === 0 ? 'Sold Out' : inCart > 0 ? `+ Add (${inCart})` : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
