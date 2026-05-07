import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'food',
    price: '',
    stock: '',
    description: '',
    imageUrl: '',
    isFeatured: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, imageUrl: jpgDataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/admin/products/add', {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      });
      alert('Product added successfully!');
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
          <p className="text-sm text-slate-500">Create a new item for the marketplace.</p>
        </div>
        <button onClick={() => navigate('/admin/products')} className="text-sm text-[#1D9E75] font-medium hover:underline">
          ← Back to Products
        </button>
      </div>

      {error && <div className="m-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none">
              <option value="food">Food</option>
              <option value="medicine">Medicine</option>
              <option value="accessory">Accessory</option>
              <option value="toy">Toy</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹) *</label>
            <input type="number" name="price" required value={formData.price} onChange={handleChange} min="0" step="0.01" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock *</label>
            <input type="number" name="stock" required value={formData.stock} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">OPTION 1: Upload Image File (auto-converts to JPG)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">OPTION 2: Or Paste Image URL</label>
                <input 
                  type="url" 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none text-sm" 
                  placeholder="https://example.com/image.jpg" 
                />
              </div>
            </div>
            {formData.imageUrl && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600">Image Preview</p>
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} 
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear Image
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none"></textarea>
          </div>
          
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 text-[#1D9E75] rounded border-slate-300 focus:ring-[#1D9E75]" />
              <span className="text-sm font-medium text-slate-700">Mark as Featured Product (Shows on homepage)</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <button type="submit" disabled={loading} className="px-8 py-3 bg-[#1D9E75] hover:bg-[#168a65] text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
