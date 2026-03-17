const inputCls = 'w-full box-border px-3.5 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none bg-white font-[Inter,sans-serif] mb-4';
const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

export function OrgSettings() {
  return (
    <div>
      <div className="text-base font-semibold text-slate-900 mb-5">Organization Details</div>
      <div className="grid grid-cols-2">
        <div className="pr-5">
          <label className={labelCls}>Organization Name</label>
          <input className={inputCls} defaultValue="ABC Insurance Company" />
          <label className={labelCls}>Industry</label>
          <select className={`${inputCls} appearance-none`}>
            <option>Healthcare / Insurance</option>
            <option>Finance</option>
            <option>Technology</option>
          </select>
          <label className={labelCls}>Headquarters</label>
          <input className={inputCls} defaultValue="Mumbai, India" />
        </div>
        <div className="pl-5 border-l border-slate-200">
          <label className={labelCls}>CIN / Registration No.</label>
          <input className={inputCls} defaultValue="U66000MH2015PLC123456" />
          <label className={labelCls}>IRDAI License Number</label>
          <input className={inputCls} defaultValue="IRDAI/HLT/2015/123" />
          <label className={labelCls}>Primary Contact Email</label>
          <input className={inputCls} defaultValue="risk@abcinsurance.in" />
        </div>
      </div>
      <label className={labelCls}>Organization Logo URL</label>
      <input className={inputCls} placeholder="https://..." />
      <button className="bg-sky-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-sky-600">
        Save Changes
      </button>
    </div>
  );
}
