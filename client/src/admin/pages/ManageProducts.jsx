import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      isFeatured: product.isFeatured || false,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.patch(`/admin/products/${id}`, editForm);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to update product');
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = p.stock < 5 && p.stock > 0;
    if (stockFilter === 'out') matchesStock = p.stock === 0;
    if (stockFilter === 'in') matchesStock = p.stock >= 5;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header & Filters */}
      <div className="p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name or brand..."
            className="w-full sm:w-80 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="medicine">Medicine</option>
              <option value="accessory">Accessory</option>
              <option value="toy">Toy</option>
            </select>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">All Stock</option>
              <option value="in">In Stock (5+)</option>
              <option value="low">Low Stock (&lt;5)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">Image</th>
              <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('name')}>
                Name & Brand {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('price')}>
                Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => requestSort('stock')}>
                Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-500">Loading...</td></tr>
            ) : sortedProducts.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-500">No products found.</td></tr>
            ) : (
              sortedProducts.map((product) => {
                const isEditing = editingId === product._id;
                
                return (
                  <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl">📦</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border p-1 rounded text-sm" />
                      ) : (
                        <>
                          <p className="font-bold text-slate-800">{product.name} {product.isFeatured && <span className="text-orange-500 ml-1" title="Featured">⭐</span>}</p>
                          <p className="text-sm text-slate-500">{product.brand || 'No brand'}</p>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 capitalize">
                      {product.category}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-20 border p-1 rounded text-sm" />
                      ) : (
                        <span className="font-medium">₹{product.price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} className="w-20 border p-1 rounded text-sm" />
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.stock >= 5 ? 'bg-green-100 text-green-700' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.stock >= 5 ? 'In Stock' : product.stock > 0 ? `Low (${product.stock})` : 'Out of Stock'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <label className="flex items-center gap-1 text-xs mr-2"><input type="checkbox" checked={editForm.isFeatured} onChange={e => setEditForm({...editForm, isFeatured: e.target.checked})} /> Featured</label>
                          <button onClick={() => setEditingId(null)} className="text-slate-500 text-sm">Cancel</button>
                          <button onClick={() => handleSaveEdit(product._id)} className="text-[#1D9E75] text-sm font-bold">Save</button>
                        </div>
                      ) : (
                        <div className="space-x-3">
                          <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">✏️ Edit</button>
                          <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">🗑️ Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProducts;
