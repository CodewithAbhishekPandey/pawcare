import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const SPECIALIZATIONS = ['Dogs', 'Cats', 'Birds', 'Rabbits', 'Exotic', 'General'];

const AddVet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slotsPreview, setSlotsPreview] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', consultFee: '',
    clinicName: '', address: '', latitude: '', longitude: '',
    specializations: [],
    openTime: '09:00', closeTime: '17:00', slotInterval: '30',
    isVerified: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'specializations') {
      const updatedSpecs = checked
        ? [...formData.specializations, value]
        : formData.specializations.filter(s => s !== value);
      setFormData({ ...formData, specializations: updatedSpecs });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const generatePassword = () => {
    const randomPass = Math.random().toString(36).slice(-8) + 'A1!';
    setFormData({ ...formData, password: randomPass });
  };

  const handleGenerateSlots = () => {
    if (!formData.openTime || !formData.closeTime) return;
    const slots = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const [openH, openM] = formData.openTime.split(':').map(Number);
    const [closeH, closeM] = formData.closeTime.split(':').map(Number);
    const startMin = openH * 60 + openM;
    const endMin = closeH * 60 + closeM;
    const interval = parseInt(formData.slotInterval);

    for (const day of days) {
      for (let m = startMin; m + interval <= endMin; m += interval) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        slots.push({
          day,
          time: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
          isBooked: false
        });
      }
    }
    setSlotsPreview(slots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Add generated slots to form data before submission if preview exists
    const submitData = { ...formData, availableSlots: slotsPreview.length > 0 ? slotsPreview : undefined };

    try {
      await api.post('/admin/vets/add', submitData);
      alert(`Vet Dr. ${formData.name} and clinic ${formData.clinicName} added successfully.`);
      navigate('/admin/vets');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Add New Vet & Clinic</h2>
        <p className="text-sm text-slate-500">Manually onboard a vet and their primary clinic.</p>
      </div>

      {error && <div className="m-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Section 1: Vet Account */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">1. Vet Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" placeholder="Dr. Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" placeholder="vet@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <div className="flex gap-2">
                <input type="text" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
                <button type="button" onClick={generatePassword} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium whitespace-nowrap">Auto-gen</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Consult Fee (₹)</label>
              <input type="number" name="consultFee" value={formData.consultFee} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" min="0" />
            </div>
          </div>
        </div>

        {/* Section 2: Clinic Details */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">2. Clinic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name *</label>
              <input type="text" name="clinicName" required value={formData.clinicName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
              <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" placeholder="28.4595" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
              <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" placeholder="77.0266" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Specializations</label>
              <div className="flex flex-wrap gap-4">
                {SPECIALIZATIONS.map(spec => (
                  <label key={spec} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="specializations" value={spec} checked={formData.specializations.includes(spec)} onChange={handleChange} className="w-4 h-4 text-[#1D9E75] rounded border-slate-300 focus:ring-[#1D9E75]" />
                    <span className="text-sm text-slate-700">{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Opening Time</label>
                <input type="time" name="openTime" value={formData.openTime} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Closing Time</label>
                <input type="time" name="closeTime" value={formData.closeTime} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slot Interval</label>
                <select name="slotInterval" value={formData.slotInterval} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] outline-none">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="button" onClick={handleGenerateSlots} className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Preview Slots
                </button>
              </div>
            </div>
          </div>
          
          {slotsPreview.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Generated Slots ({slotsPreview.length} slots/week)</p>
              <div className="max-h-40 overflow-y-auto p-3 bg-slate-100 rounded-lg text-xs text-slate-600 flex flex-wrap gap-2">
                {slotsPreview.slice(0, 20).map((s, i) => (
                  <span key={i} className="bg-white px-2 py-1 rounded border border-slate-200">{s.day} {s.time}</span>
                ))}
                {slotsPreview.length > 20 && <span className="px-2 py-1">...and {slotsPreview.length - 20} more</span>}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isVerified" checked={formData.isVerified} onChange={handleChange} className="w-5 h-5 text-[#1D9E75] rounded border-slate-300 focus:ring-[#1D9E75]" />
              <span className="text-sm font-medium text-slate-700">Auto-verify clinic and vet (Active immediately)</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/vets')} className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-[#1D9E75] hover:bg-[#168a65] text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : 'Add Vet & Clinic'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVet;
