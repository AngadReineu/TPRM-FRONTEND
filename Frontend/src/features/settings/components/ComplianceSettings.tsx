const inputCls = 'w-full box-border px-3.5 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none bg-white font-[Inter,sans-serif] mb-4';
const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

export function ComplianceSettings() {
  return (
    <div>
      <div className="text-base font-semibold text-slate-900 mb-5">Compliance Framework</div>
      <div className="flex flex-col gap-2.5 mb-5">
        {[
          { label: 'IRDAI Data Governance Framework', checked: true },
          { label: 'DPDPA (Digital Personal Data Protection Act)', checked: true },
          { label: 'ISO 27001', checked: true },
          { label: 'SOC 2 Type II', checked: false },
          { label: 'GDPR', checked: false },
          { label: 'PCI DSS', checked: false },
        ].map(f => (
          <label key={f.label} className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700">
            <div
              className={`w-[18px] h-[18px] rounded shrink-0 flex items-center justify-center ${
                f.checked
                  ? 'border-2 border-sky-500 bg-sky-500'
                  : 'border-2 border-slate-300 bg-white'
              }`}
            >
              {f.checked && <span className="text-white text-[11px] font-bold">&#10003;</span>}
            </div>
            {f.label}
          </label>
        ))}
      </div>
      <label className={labelCls}>Regulatory Contact Email</label>
      <input className={inputCls} defaultValue="compliance@abcinsurance.in" />
      <label className={labelCls}>Data Retention Policy (days)</label>
      <input className={inputCls} type="number" defaultValue={2555} />
      <button className="bg-sky-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-sky-600">
        Save
      </button>
    </div>
  );
}
