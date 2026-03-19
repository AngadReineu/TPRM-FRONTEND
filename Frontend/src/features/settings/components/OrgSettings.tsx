import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchOrgSettings, updateOrgSettings, getOrgSettings } from '../services/settings.data';
import type { OrgSettings as OrgSettingsType } from '../types';

const inputCls = 'w-full box-border px-3.5 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none bg-white font-[Inter,sans-serif] mb-4 disabled:bg-slate-50 disabled:cursor-not-allowed';
const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

export function OrgSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<OrgSettingsType>(getOrgSettings());

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const data = await fetchOrgSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load org settings:', error);
        toast.error('Failed to load organization settings');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (field: keyof OrgSettingsType, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateOrgSettings(settings);
      setSettings(updated);
      toast.success('Organization settings saved successfully');
    } catch (error) {
      console.error('Failed to save org settings:', error);
      toast.error('Failed to save organization settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
        <span className="ml-2 text-slate-500">Loading settings...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="text-base font-semibold text-slate-900 mb-5">Organization Details</div>
      <div className="grid grid-cols-2">
        <div className="pr-5">
          <label className={labelCls}>Organization Name</label>
          <input
            className={inputCls}
            value={settings.orgName}
            onChange={e => handleChange('orgName', e.target.value)}
            disabled={saving}
          />
          <label className={labelCls}>Industry</label>
          <select
            className={`${inputCls} appearance-none`}
            value={settings.industry}
            onChange={e => handleChange('industry', e.target.value)}
            disabled={saving}
          >
            <option>Healthcare / Insurance</option>
            <option>Finance</option>
            <option>Technology</option>
          </select>
          <label className={labelCls}>Headquarters</label>
          <input
            className={inputCls}
            value={settings.headquarters}
            onChange={e => handleChange('headquarters', e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="pl-5 border-l border-slate-200">
          <label className={labelCls}>CIN / Registration No.</label>
          <input
            className={inputCls}
            value={settings.cinNumber}
            onChange={e => handleChange('cinNumber', e.target.value)}
            disabled={saving}
          />
          <label className={labelCls}>IRDAI License Number</label>
          <input
            className={inputCls}
            value={settings.irdaiLicenseNumber}
            onChange={e => handleChange('irdaiLicenseNumber', e.target.value)}
            disabled={saving}
          />
          <label className={labelCls}>Primary Contact Email</label>
          <input
            className={inputCls}
            value={settings.primaryContactEmail}
            onChange={e => handleChange('primaryContactEmail', e.target.value)}
            disabled={saving}
          />
        </div>
      </div>
      <label className={labelCls}>Organization Logo URL</label>
      <input
        className={inputCls}
        placeholder="https://..."
        value={settings.logoUrl || ''}
        onChange={e => handleChange('logoUrl', e.target.value)}
        disabled={saving}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-sky-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
