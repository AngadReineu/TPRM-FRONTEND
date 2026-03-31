import { useState, useEffect } from 'react';
import React from 'react';
import { Eye, Bell, RefreshCw, Trash2, Loader2, Plus, X, Users, ShieldAlert, ClipboardCheck, Shield, ShieldOff, Settings2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { SearchInput } from '../../../components/common/SearchInput';
import { StageBadge } from '../../../components/common/StageBadge';
import { ConfigurePiiModal } from '../components/ConfigurePiiModal';

import type { Supplier, AssessmentStatus } from '../types';
import type { Stage, PiiFlow } from '../../../types/shared';
import { getVendors, deleteVendor, createVendor, updateVendor } from '../services/vendors.data';
import { getDivisions } from '../../library/services/library.data';
import { AssessmentBadge } from '../components/AssessmentBadge';
import { SupplierDetailModal } from '../components/SupplierDetailModal';

/* ── Validation helpers ─────────────────────────────────── */
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidMobile = (mobile: string) => /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ''));
const isValidGST = (gst: string) => 
  gst === '' || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst.toUpperCase());
const isValidPAN = (pan: string) => 
  pan === '' || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());

const fieldClass = (isValid: boolean, value: string) =>
  `w-full border rounded-lg text-sm py-2.5 px-3 outline-none focus:ring-2 ${
    value && !isValid 
      ? 'border-red-300 focus:ring-red-200' 
      : value && isValid 
      ? 'border-emerald-300 focus:ring-emerald-200'
      : 'border-slate-200 focus:ring-sky-200'
  }`;

/* ── Contact types ─────────────────────────────────────── */
interface Contact {
  id: string;
  label: string;
  email: string;
  isDefault: boolean;
}

/* ── Create Supplier Modal ─────────────────────── */
interface DepartmentOption {
  id: string;
  name: string;
  lifecycleStage?: Stage;
}

function CreateSupplierModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (supplier: Supplier) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    departmentId: '',
    stage: 'Acquisition' as Stage,
    lifecycleMapping: [] as string[],
    contactPerson: '',
    phone: '',
    website: '',
    gstNumber: '',
    panNumber: '',
    contractStart: '',
    contractEnd: '',
  });
  const [internalContacts, setInternalContacts] = useState<Contact[]>([
    { id: 'default-internal', label: 'Business Owner', email: '', isDefault: true }
  ]);
  const [supplierContacts, setSupplierContacts] = useState<Contact[]>([
    { id: 'default-supplier', label: 'Account Manager', email: '', isDefault: true }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  // Fetch departments on mount
  useEffect(() => {
    (async () => {
      try {
        const divs = await getDivisions();
        setDepartments(divs.map(d => ({ id: d.id, name: d.name, lifecycleStage: d.lifecycleStage })));
      } catch {
        // Fallback to empty
      } finally {
        setLoadingDepts(false);
      }
    })();
  }, []);

  const stages: { value: Stage; label: string }[] = [
    { value: 'Acquisition', label: 'Acquisition' },
    { value: 'Retention', label: 'Retention' },
    { value: 'Upgradation', label: 'Upgradation' },
    { value: 'Offboarding', label: 'Offboarding' },
  ];

  const lifecycleOptions = [
    { id: 'acq', label: 'Customer Acquisition', color: '#0EA5E9' },
    { id: 'ret', label: 'Customer Retention', color: '#10B981' },
    { id: 'upg', label: 'Customer Upgradation', color: '#F59E0B' },
    { id: 'off', label: 'Customer Offboarding', color: '#94A3B8' },
  ];

  const stageColors: Record<Stage, string> = {
    Acquisition: '#0EA5E9',
    Retention: '#10B981',
    Upgradation: '#F59E0B',
    Offboarding: '#94A3B8',
  };

  function toggleLifecycle(id: string) {
    setForm(f => ({
      ...f,
      lifecycleMapping: f.lifecycleMapping.includes(id)
        ? f.lifecycleMapping.filter(x => x !== id)
        : [...f.lifecycleMapping, id],
    }));
  }

  // Contact management helpers
  function addContact(side: 'internal' | 'supplier') {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      label: '',
      email: '',
      isDefault: false,
    };
    if (side === 'internal') {
      setInternalContacts(prev => [...prev, newContact]);
    } else {
      setSupplierContacts(prev => [...prev, newContact]);
    }
  }

  function removeContact(side: 'internal' | 'supplier', id: string) {
    if (side === 'internal') {
      setInternalContacts(prev => prev.filter(c => c.id !== id));
    } else {
      setSupplierContacts(prev => prev.filter(c => c.id !== id));
    }
  }

  function updateContact(side: 'internal' | 'supplier', id: string, field: 'label' | 'email', value: string) {
    const setter = side === 'internal' ? setInternalContacts : setSupplierContacts;
    setter(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }

  // Validation
  const isFormValid = 
    form.name.trim().length > 0 &&
    isValidEmail(form.email) &&
    form.departmentId !== '' &&
    (!form.phone || isValidMobile(form.phone)) &&
    (!form.gstNumber || isValidGST(form.gstNumber)) &&
    (!form.panNumber || isValidPAN(form.panNumber)) &&
    internalContacts[0].email !== '' && isValidEmail(internalContacts[0].email) &&
    supplierContacts[0].email !== '' && isValidEmail(supplierContacts[0].email);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setSubmitting(true);
    try {
      const selectedDept = departments.find(d => d.id === form.departmentId);
      const vendorData = {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.phone || undefined,
        gstNumber: form.gstNumber || undefined,
        panNumber: form.panNumber || undefined,
        stage: form.stage,
        stageColor: stageColors[form.stage],
        score: 50,
        risk: 'Medium',
        riskColor: '#64748B',
        assessment: 'pending' as AssessmentStatus,
        pii: { configured: false },
        contractEnd: form.contractEnd || undefined,
        contractWarning: false,
        internalSpoc: internalContacts[0]?.email || undefined,
        externalSpoc: supplierContacts[0]?.email || undefined,
        divisionId: form.departmentId,
        divisionName: selectedDept?.name,
        stakeholderMatrix: {
          internal: internalContacts.filter(c => c.email).map(c => ({ label: c.label, email: c.email })),
          supplier: supplierContacts.filter(c => c.email).map(c => ({ label: c.label, email: c.email })),
        },
      };

      const created = await createVendor(vendorData);
      toast.success(`Supplier "${form.name}" created successfully`);
      onCreated(created);
      onClose();
    } catch (err) {
      toast.error('Failed to create supplier');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Add Supplier</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Department Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            {loadingDepts ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                Loading departments...
              </div>
            ) : (
              <select
                value={form.departmentId}
                onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} {dept.lifecycleStage ? `(${dept.lifecycleStage})` : ''}
                  </option>
                ))}
              </select>
            )}
            {departments.length === 0 && !loadingDepts && (
              <p className="text-xs text-amber-600 mt-1">
                No departments found. Create departments in the Library page first.
              </p>
            )}
          </div>

          {/* Supplier Stage */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Supplier Stage <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {stages.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, stage: s.value }))}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                    form.stage === s.value
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lifecycle Mapping */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-sky-500 rounded-full" />
              <label className="text-sm font-semibold text-slate-700">Lifecycle Mapping</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {lifecycleOptions.map(opt => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={form.lifecycleMapping.includes(opt.id)}
                    onChange={() => toggleLifecycle(opt.id)}
                    className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                  <span className="text-xs text-slate-600">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Supplier Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., XYZ Corporation"
              className={fieldClass(form.name.trim().length > 0, form.name)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="contact@company.com"
                className={fieldClass(isValidEmail(form.email), form.email)}
              />
              {form.email && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidEmail(form.email) ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={16} className="text-red-400" />
                  )}
                </span>
              )}
            </div>
            {form.email && !isValidEmail(form.email) && (
              <p className="text-xs text-red-500 mt-1">Invalid email format</p>
            )}
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Person</label>
            <input
              type="text"
              value={form.contactPerson}
              onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
              placeholder="Full name"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Phone (Mobile) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile</label>
            <div className="relative">
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="9876543210"
                className={fieldClass(!form.phone || isValidMobile(form.phone), form.phone)}
              />
              {form.phone && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidMobile(form.phone) ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={16} className="text-red-400" />
                  )}
                </span>
              )}
            </div>
            {form.phone && !isValidMobile(form.phone) && (
              <p className="text-xs text-red-500 mt-1">Invalid mobile number (10 digits starting with 6-9)</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* GST & PAN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">GST Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.gstNumber}
                  onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
                  placeholder="22AAAAA0000A1Z5"
                  className={fieldClass(isValidGST(form.gstNumber), form.gstNumber)}
                />
                {form.gstNumber && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValidGST(form.gstNumber) ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400" />
                    )}
                  </span>
                )}
              </div>
              {form.gstNumber && !isValidGST(form.gstNumber) && (
                <p className="text-xs text-red-500 mt-1">Invalid GST format</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">PAN Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.panNumber}
                  onChange={e => setForm(f => ({ ...f, panNumber: e.target.value.toUpperCase() }))}
                  placeholder="ABCDE1234F"
                  className={fieldClass(isValidPAN(form.panNumber), form.panNumber)}
                />
                {form.panNumber && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValidPAN(form.panNumber) ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400" />
                    )}
                  </span>
                )}
              </div>
              {form.panNumber && !isValidPAN(form.panNumber) && (
                <p className="text-xs text-red-500 mt-1">Invalid PAN format</p>
              )}
            </div>
          </div>

          {/* Contract Period */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-amber-500 rounded-full" />
              <label className="text-sm font-semibold text-slate-700">Contract Period</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.contractStart}
                  onChange={e => setForm(f => ({ ...f, contractStart: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={form.contractEnd}
                  onChange={e => setForm(f => ({ ...f, contractEnd: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Stakeholder Matrix */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-violet-500 rounded-full" />
              <label className="text-sm font-semibold text-slate-700">
                Stakeholder Matrix <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Internal Contacts */}
              <div className="pr-3 border-r border-slate-100">
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wide mb-3">Internal</p>
                <div className="flex flex-col gap-3">
                  {internalContacts.map(contact => (
                    <div key={contact.id}>
                      {contact.isDefault ? (
                        <span className="text-xs font-semibold text-sky-600 bg-blue-50 px-2 py-0.5 rounded mb-1.5 inline-block">
                          {contact.label}
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={contact.label}
                          onChange={e => updateContact('internal', contact.id, 'label', e.target.value)}
                          placeholder="Role label (e.g. Finance, Legal)"
                          className="text-xs font-semibold text-slate-600 mb-1 border-none bg-transparent outline-none w-full"
                        />
                      )}
                      <div className="flex gap-1.5 items-center">
                        <div className="relative flex-1">
                          <input
                            type="email"
                            value={contact.email}
                            onChange={e => updateContact('internal', contact.id, 'email', e.target.value)}
                            placeholder="email@company.com"
                            className={`w-full border rounded-lg text-xs py-2 px-2.5 outline-none focus:ring-1 pr-8 ${
                              contact.email && !isValidEmail(contact.email)
                                ? 'border-red-300 focus:ring-red-200'
                                : contact.email && isValidEmail(contact.email)
                                ? 'border-emerald-300 focus:ring-emerald-200'
                                : 'border-slate-200 focus:ring-sky-400'
                            }`}
                          />
                          {contact.email && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2">
                              {isValidEmail(contact.email) ? (
                                <Check size={14} className="text-emerald-500" />
                              ) : (
                                <AlertCircle size={14} className="text-red-400" />
                              )}
                            </span>
                          )}
                        </div>
                        {!contact.isDefault && (
                          <button
                            type="button"
                            onClick={() => removeContact('internal', contact.id)}
                            className="text-slate-300 hover:text-red-400 text-lg font-bold bg-transparent border-none cursor-pointer px-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {contact.isDefault && contact.email && !isValidEmail(contact.email) && (
                        <p className="text-[10px] text-red-500 mt-0.5">Invalid email</p>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addContact('internal')}
                    className="flex items-center gap-1 text-xs text-sky-500 border border-dashed border-sky-200 rounded-lg px-2.5 py-1.5 w-full justify-center hover:bg-blue-50 cursor-pointer bg-transparent mt-1"
                  >
                    + Add Contact
                  </button>
                </div>
              </div>

              {/* Supplier Contacts */}
              <div className="pl-3">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-3">Supplier</p>
                <div className="flex flex-col gap-3">
                  {supplierContacts.map(contact => (
                    <div key={contact.id}>
                      {contact.isDefault ? (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mb-1.5 inline-block">
                          {contact.label}
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={contact.label}
                          onChange={e => updateContact('supplier', contact.id, 'label', e.target.value)}
                          placeholder="Role label (e.g. Finance, Legal)"
                          className="text-xs font-semibold text-slate-600 mb-1 border-none bg-transparent outline-none w-full"
                        />
                      )}
                      <div className="flex gap-1.5 items-center">
                        <div className="relative flex-1">
                          <input
                            type="email"
                            value={contact.email}
                            onChange={e => updateContact('supplier', contact.id, 'email', e.target.value)}
                            placeholder="email@supplier.com"
                            className={`w-full border rounded-lg text-xs py-2 px-2.5 outline-none focus:ring-1 pr-8 ${
                              contact.email && !isValidEmail(contact.email)
                                ? 'border-red-300 focus:ring-red-200'
                                : contact.email && isValidEmail(contact.email)
                                ? 'border-emerald-300 focus:ring-emerald-200'
                                : 'border-slate-200 focus:ring-sky-400'
                            }`}
                          />
                          {contact.email && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2">
                              {isValidEmail(contact.email) ? (
                                <Check size={14} className="text-emerald-500" />
                              ) : (
                                <AlertCircle size={14} className="text-red-400" />
                              )}
                            </span>
                          )}
                        </div>
                        {!contact.isDefault && (
                          <button
                            type="button"
                            onClick={() => removeContact('supplier', contact.id)}
                            className="text-slate-300 hover:text-red-400 text-lg font-bold bg-transparent border-none cursor-pointer px-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {contact.isDefault && contact.email && !isValidEmail(contact.email) && (
                        <p className="text-[10px] text-red-500 mt-0.5">Invalid email</p>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addContact('supplier')}
                    className="flex items-center gap-1 text-xs text-amber-500 border border-dashed border-amber-200 rounded-lg px-2.5 py-1.5 w-full justify-center hover:bg-amber-50 cursor-pointer bg-transparent mt-1"
                  >
                    + Add Contact
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PII Configuration Notice */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-600 text-xs">!</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700">PII Configuration — Locked</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Data sharing configuration is disabled until the initial risk assessment and AI scan are complete.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className="flex-1 px-4 py-2.5 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Creating...' : 'Add Supplier →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── KPI Card component ─────────────────────────────────── */
function KpiCard({ 
  icon, 
  iconBg, 
  iconColor, 
  value, 
  label 
}: { 
  icon: React.ReactNode; 
  iconBg: string; 
  iconColor: string; 
  value: number; 
  label: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <div style={{ color: iconColor }}>{icon}</div>
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}

/* ── Flow Badge component ─────────────────────────────────── */
function FlowBadge({ flow }: { flow?: PiiFlow }) {
  if (!flow) return <span className="text-slate-400 text-xs">—</span>;
  
  const styles: Record<PiiFlow, { bg: string; text: string }> = {
    Share: { bg: 'bg-sky-50', text: 'text-sky-600' },
    Ingest: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    Both: { bg: 'bg-violet-50', text: 'text-violet-600' },
  };
  
  const style = styles[flow] || styles.Share;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {flow}
    </span>
  );
}

/* ── Table Headers ─────────────────────────────────────────── */
const TABLE_HEADERS = ['Supplier', 'Stage', 'Risk Score', 'Assessment', 'PII Sharing', 'Flow', 'Contract End', 'Agent', 'Last Activity', 'Actions'];

export function VendorsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [configureSupplier, setConfigureSupplier] = useState<Supplier | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function loadVendors() {
      try {
        setLoading(true);
        setError(null);
        const data = await getVendors();
        setSuppliers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vendors');
        toast.error('Failed to load vendors');
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
  }, []);

  const filtered = suppliers.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.includes(search.toLowerCase());
    const matchStage = stageFilter === 'All' || s.stage === stageFilter;
    const matchRisk = riskFilter === 'All' || s.risk === riskFilter;
    return matchSearch && matchStage && matchRisk;
  });

  // Split by PII configuration
  const piiConfigured = filtered.filter(s => s.pii.configured === true);
  const piiNotConfigured = filtered.filter(s => s.pii.configured === false);

  // KPI calculations
  const highRiskCount = suppliers.filter(s => s.risk === 'High' || s.risk === 'Critical').length;
  const assessmentsDueCount = suppliers.filter(s => s.assessment === 'overdue' || s.assessment === 'pending').length;
  const piiConfiguredCount = suppliers.filter(s => s.pii.configured === true).length;

  async function handleRemove(s: Supplier) {
    try {
      await deleteVendor(s.id);
      setSuppliers(prev => prev.filter(x => x.id !== s.id));
      toast.error(`${s.name} removed from TPRM`);
    } catch (err) {
      setSuppliers(prev => prev.filter(x => x.id !== s.id));
      toast.error(`${s.name} removed from TPRM`);
    }
  }

  async function handlePiiSave(supplierId: string, piiFlow: string, method: string, icons: string[]) {
    try {
      const data = { piiFlow, pii: { configured: true, method, icons } };
      const updated = await updateVendor(supplierId, data);
      setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, piiFlow: updated.piiFlow, pii: updated.pii } as Supplier : s));
      toast.success('Data sharing configuration saved successfully');
    } catch (err) {
      toast.error('Failed to save data sharing configuration');
      throw err;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <span className="ml-3 text-slate-500">Loading vendors...</span>
      </div>
    );
  }

  if (error && suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1280px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0">Third Party Risk Management</h1>
          <p className="text-sm text-slate-500 mt-1 mb-0">{suppliers.length} suppliers across 4 stages</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors"
        >
          <Plus size={16} />
          Add Supplier
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          icon={<Users size={20} />}
          iconBg="#EFF6FF"
          iconColor="#0EA5E9"
          value={suppliers.length}
          label="Total Suppliers"
        />
        <KpiCard
          icon={<ShieldAlert size={20} />}
          iconBg="#FEF2F2"
          iconColor="#EF4444"
          value={highRiskCount}
          label="High Risk"
        />
        <KpiCard
          icon={<ClipboardCheck size={20} />}
          iconBg="#FFFBEB"
          iconColor="#F59E0B"
          value={assessmentsDueCount}
          label="Assessments Due"
        />
        <KpiCard
          icon={<Shield size={20} />}
          iconBg="#ECFDF5"
          iconColor="#10B981"
          value={piiConfiguredCount}
          label="PII Configured"
        />
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{filtered.length} suppliers</span>
        <div className="flex gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search suppliers..."
            className="w-[200px]"
          />
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-700"
          >
            {['All', 'Acquisition', 'Retention', 'Upgradation', 'Offboarding'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-700"
          >
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PII Configured Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Section Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">PII Data Sharing — Configured</h2>
              <p className="text-xs text-slate-500 mt-0.5">Suppliers with active data sharing configurations</p>
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {piiConfigured.length} suppliers
          </span>
        </div>

        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {TABLE_HEADERS.map(h => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider text-left whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {piiConfigured.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400">
                  No suppliers with PII configured
                </td>
              </tr>
            ) : (
              piiConfigured.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`hover:bg-slate-50/80 ${idx < piiConfigured.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  {/* Supplier */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Stage */}
                  <td className="px-4 py-3 align-middle">
                    <StageBadge stage={s.stage} />
                  </td>
                  {/* Risk Score */}
                  <td className="px-4 py-3 align-middle">
                    <div>
                      <span className="text-sm font-bold" style={{ color: s.riskColor }}>{s.score}</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${s.score}%`, backgroundColor: s.riskColor }}
                        />
                      </div>
                    </div>
                  </td>
                  {/* Assessment */}
                  <td className="px-4 py-3 align-middle">
                    <AssessmentBadge status={s.assessment} />
                  </td>
                  {/* PII Sharing */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-xs text-emerald-600 font-medium">Active</span>
                    </div>
                  </td>
                  {/* Flow */}
                  <td className="px-4 py-3 align-middle">
                    <FlowBadge flow={s.piiFlow} />
                  </td>
                  {/* Contract End */}
                  <td className="px-4 py-3 align-middle">
                    <div className={`text-sm ${s.contractWarning ? 'text-amber-500 font-semibold' : 'text-slate-700'}`}>
                      {s.contractEnd}
                      {s.contractWarning && (
                        <span className="ml-1.5 text-[10px] bg-amber-50 text-amber-500 px-1.5 py-0.5 rounded font-medium">
                          Expiring
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Agent */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs font-semibold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">
                      {s.agentId}
                    </span>
                  </td>
                  {/* Last Activity */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs text-slate-400">{s.lastActivity}</span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => setViewSupplier(s)}
                        title="View details"
                        className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-sky-500 hover:bg-sky-50"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => toast.success(`Reminder sent to ${s.name}`)}
                        title="Send reminder"
                        className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-amber-500 hover:bg-amber-50"
                      >
                        <Bell size={14} />
                      </button>
                      <button
                        onClick={() => toast.success(`Assessment refreshed for ${s.name}`)}
                        title="Refresh assessment"
                        className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-emerald-500 hover:bg-emerald-50"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={() => handleRemove(s)}
                        title="Remove supplier"
                        className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PII Not Configured Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Section Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
              <ShieldOff size={18} className="text-slate-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">PII Not Configured</h2>
              <p className="text-xs text-slate-500 mt-0.5">Suppliers pending data sharing setup</p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {piiNotConfigured.length} suppliers
          </span>
        </div>

        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {TABLE_HEADERS.map(h => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider text-left whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {piiNotConfigured.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400">
                  All suppliers have PII configured
                </td>
              </tr>
            ) : (
              piiNotConfigured.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`hover:bg-slate-50/80 ${idx < piiNotConfigured.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  {/* Supplier */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Stage */}
                  <td className="px-4 py-3 align-middle">
                    <StageBadge stage={s.stage} />
                  </td>
                  {/* Risk Score */}
                  <td className="px-4 py-3 align-middle">
                    <div>
                      <span className="text-sm font-bold" style={{ color: s.riskColor }}>{s.score}</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${s.score}%`, backgroundColor: s.riskColor }}
                        />
                      </div>
                    </div>
                  </td>
                  {/* Assessment */}
                  <td className="px-4 py-3 align-middle">
                    <AssessmentBadge status={s.assessment} />
                  </td>
                  {/* PII Sharing */}
                  <td className="px-4 py-3 align-middle">
                    {s.assessment === 'complete' ? (
                      <button
                        onClick={() => setConfigureSupplier(s)}
                        className="text-xs font-medium text-sky-500 hover:text-sky-600 hover:underline"
                      >
                        Configure →
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Assessment required</span>
                    )}
                  </td>
                  {/* Flow */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-slate-400 text-xs">—</span>
                  </td>
                  {/* Contract End */}
                  <td className="px-4 py-3 align-middle">
                    <div className={`text-sm ${s.contractWarning ? 'text-amber-500 font-semibold' : 'text-slate-700'}`}>
                      {s.contractEnd}
                      {s.contractWarning && (
                        <span className="ml-1.5 text-[10px] bg-amber-50 text-amber-500 px-1.5 py-0.5 rounded font-medium">
                          Expiring
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Agent */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs font-semibold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full">
                      {s.agentId}
                    </span>
                  </td>
                  {/* Last Activity */}
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs text-slate-400">{s.lastActivity}</span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => setViewSupplier(s)}
                        title="View details"
                        className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-sky-500 hover:bg-sky-50"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setConfigureSupplier(s)}
                        title="Configure PII"
                        className="p-1.5 rounded bg-transparent border-none text-sky-500 cursor-pointer hover:text-sky-600 hover:bg-sky-50"
                      >
                        <Settings2 size={14} />
                      </button>
                      <button
                        onClick={() => toast.success(`Reminder sent to ${s.name}`)}
                        title="Send reminder"
                        className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-amber-500 hover:bg-amber-50"
                      >
                        <Bell size={14} />
                      </button>
                      <button
                        onClick={() => handleRemove(s)}
                        title="Remove supplier"
                        className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals / Panels */}
      {showCreateModal && (
        <CreateSupplierModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newSupplier) => {
            setSuppliers(prev => [...prev, newSupplier]);
          }}
        />
      )}
      {viewSupplier && (
        <SupplierDetailModal
          supplier={viewSupplier}
          onClose={() => setViewSupplier(null)}
          onConfigureData={s => { setViewSupplier(null); setConfigureSupplier(s); }}
        />
      )}
      {configureSupplier && (
        <ConfigurePiiModal
          supplier={configureSupplier}
          onClose={() => setConfigureSupplier(null)}
          onSave={handlePiiSave as any}
        />
      )}
    </div>
  );
}
