import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const SiteSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vets, setVets] = useState([]);
  const [saveStatus, setSaveStatus] = useState({});

  useEffect(() => {
    fetchSettings();
    fetchVets();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching settings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVets = async () => {
    try {
      const res = await api.get('/admin/vets');
      if (res.data.success) {
        setVets(res.data.data.filter(v => v.clinic?.isVerified));
      }
    } catch (err) {
      console.error('Error fetching vets', err);
    }
  };

  const handleSave = async (key, value) => {
    setSaveStatus({ ...saveStatus, [key]: 'saving' });
    try {
      await api.patch(`/admin/settings/${key}`, { value });
      setSaveStatus({ ...saveStatus, [key]: 'saved' });
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [key]: null })), 3000);
    } catch (err) {
      console.error('Error updating setting', err);
      setSaveStatus({ ...saveStatus, [key]: 'error' });
      alert(err.response?.data?.message || 'Failed to update setting');
    }
  };

  const getSetting = (key) => settings.find(s => s.key === key);

  const updateLocalSetting = (key, val) => {
    setSettings(settings.map(s => s.key === key ? { ...s, value: val } : s));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  const renderField = (key) => {
    const s = getSetting(key);
    if (!s) return null;

    return (
      <div className="flex items-start justify-between py-4 border-b border-slate-100 last:border-0" key={s.key}>
        <div className="flex-1 pr-8">
          <label className="block text-sm font-bold text-slate-800 mb-1">{s.label}</label>
          {s.type === 'boolean' && (
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={s.value === true || s.value === 'true'}
                onChange={(e) => updateLocalSetting(s.key, e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-[#1D9E75] focus:ring-[#1D9E75]"
              />
              <span className="text-sm text-slate-600">{s.value ? 'Enabled' : 'Disabled'}</span>
            </label>
          )}
          {s.type === 'text' && (
            <input
              type="text"
              value={s.value || ''}
              onChange={(e) => updateLocalSetting(s.key, e.target.value)}
              className="mt-2 w-full max-w-lg border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none"
            />
          )}
          {s.type === 'number' && (
            <input
              type="number"
              value={s.value || 0}
              onChange={(e) => updateLocalSetting(s.key, Number(e.target.value))}
              className="mt-2 w-32 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none"
            />
          )}
          {s.type === 'json' && s.key === 'featured_vet_ids' && (
            <select
              multiple
              value={s.value || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                updateLocalSetting(s.key, values);
              }}
              className="mt-2 w-full max-w-lg border border-slate-300 rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none"
            >
              {vets.map(v => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.clinic?.name})
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-3 pt-2">
          {saveStatus[s.key] === 'saved' && <span className="text-green-500 text-sm font-medium">Saved ✓</span>}
          {saveStatus[s.key] === 'saving' && <span className="text-slate-400 text-sm">Saving...</span>}
          <button
            onClick={() => handleSave(s.key, s.value)}
            disabled={saveStatus[s.key] === 'saving'}
            className="px-4 py-2 bg-[#1D9E75] hover:bg-[#168a65] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <p className="text-slate-500">Manage platform-wide settings dynamically.</p>
      </div>

      <div className="space-y-6">
        {/* Platform Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Platform Controls</h3>
          </div>
          <div className="px-6">
            {renderField('consult_enabled')}
            {renderField('marketplace_enabled')}
          </div>
        </div>

        {/* Financial */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Financial Settings</h3>
          </div>
          <div className="px-6">
            {renderField('platform_fee_percent')}
            {renderField('min_consult_fee')}
          </div>
        </div>

        {/* Homepage Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Homepage Content</h3>
          </div>
          <div className="px-6">
            {renderField('homepage_banner_text')}
            {renderField('homepage_banner_subtext')}
          </div>
        </div>

        {/* Consult Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Consult Settings</h3>
          </div>
          <div className="px-6">
            {renderField('max_consult_wait_minutes')}
          </div>
        </div>

        {/* Featured Vets */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Featured Vets (Hold Ctrl/Cmd to select multiple)</h3>
          </div>
          <div className="px-6">
            {renderField('featured_vet_ids')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
