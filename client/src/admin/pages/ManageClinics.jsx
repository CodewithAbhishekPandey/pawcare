import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  // Edit State
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const res = await api.get('/admin/clinics');
      if (res.data.success) {
        setClinics(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching clinics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (clinic) => {
    setEditingId(clinic._id);
    setEditForm({
      name: clinic.name,
      address: clinic.address,
      latitude: clinic.location?.coordinates[1] || 0,
      longitude: clinic.location?.coordinates[0] || 0,
      isVerified: clinic.isVerified,
      openTime: clinic.timings?.open || '09:00',
      closeTime: clinic.timings?.close || '17:00',
    });
  };

  const handleSave = async (id) => {
    try {
      await api.patch(`/admin/clinics/${id}`, {
        name: editForm.name,
        address: editForm.address,
        latitude: parseFloat(editForm.latitude),
        longitude: parseFloat(editForm.longitude),
        isVerified: editForm.isVerified,
        timings: { open: editForm.openTime, close: editForm.closeTime }
      });
      setEditingId(null);
      fetchClinics();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update clinic');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Manage Clinics</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-semibold">Clinic Name</th>
              <th className="px-6 py-4 font-semibold">Vet Owner</th>
              <th className="px-6 py-4 font-semibold">Location</th>
              <th className="px-6 py-4 font-semibold">Timings</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-500">Loading...</td></tr>
            ) : clinics.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-500">No clinics found.</td></tr>
            ) : (
              clinics.map((clinic) => {
                const isEditing = editingId === clinic._id;
                
                return (
                  <tr key={clinic._id} className="hover:bg-slate-50 transition-colors">
                    {/* Clinic Name */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border p-1 rounded" />
                      ) : (
                        <p className="font-bold text-slate-800">{clinic.name}</p>
                      )}
                    </td>
                    
                    {/* Vet Owner */}
                    <td className="px-6 py-4 text-slate-600">
                      {clinic.ownerRef?.name || 'Unknown'}
                    </td>
                    
                    {/* Location */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input type="text" placeholder="Address" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full border p-1 rounded text-sm mb-1" />
                          <div className="flex gap-1">
                            <input type="number" placeholder="Lat" value={editForm.latitude} onChange={e => setEditForm({...editForm, latitude: e.target.value})} className="w-1/2 border p-1 rounded text-sm" />
                            <input type="number" placeholder="Lng" value={editForm.longitude} onChange={e => setEditForm({...editForm, longitude: e.target.value})} className="w-1/2 border p-1 rounded text-sm" />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-slate-600 truncate max-w-xs">{clinic.address}</p>
                          <p className="text-xs text-slate-400">
                            [{clinic.location?.coordinates[1]?.toFixed(4)}, {clinic.location?.coordinates[0]?.toFixed(4)}]
                          </p>
                        </div>
                      )}
                    </td>
                    
                    {/* Timings */}
                    <td className="px-6 py-4 text-slate-600">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <input type="time" value={editForm.openTime} onChange={e => setEditForm({...editForm, openTime: e.target.value})} className="border p-1 rounded text-sm w-20" />
                          <span className="self-center">-</span>
                          <input type="time" value={editForm.closeTime} onChange={e => setEditForm({...editForm, closeTime: e.target.value})} className="border p-1 rounded text-sm w-20" />
                        </div>
                      ) : (
                        <p className="text-sm">{clinic.timings?.open || '--'} - {clinic.timings?.close || '--'}</p>
                      )}
                      {!isEditing && <p className="text-xs text-slate-400">{clinic.availableSlots?.length || 0} slots</p>}
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <label className="flex items-center gap-1 text-sm">
                          <input type="checkbox" checked={editForm.isVerified} onChange={e => setEditForm({...editForm, isVerified: e.target.checked})} />
                          Verified
                        </label>
                      ) : (
                        clinic.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Verified ✅</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending ⏳</span>
                        )
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-700 text-sm font-medium">Cancel</button>
                          <button onClick={() => handleSave(clinic._id)} className="text-[#1D9E75] hover:text-[#168a65] text-sm font-bold">Save</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditClick(clinic)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          ✏️ Edit
                        </button>
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

export default ManageClinics;
