import { Shield, Globe, HelpCircle, X } from 'lucide-react';

export function PortalHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Shield size={22} color="#0EA5E9" strokeWidth={2} />
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>TPRM Platform</span>
      </div>

      {/* Center: Title */}
      <span style={{ fontSize: '14px', color: '#64748B' }} className="hidden sm:block">
        Supplier Risk Assessment Portal
      </span>

      {/* Right: Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-[#F8FAFC]"
          style={{ fontSize: '13px', color: '#64748B' }}
        >
          <Globe size={13} />
          <span>EN</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-[#F8FAFC]"
          style={{ fontSize: '13px', color: '#64748B' }}
        >
          <HelpCircle size={13} />
          <span className="hidden sm:inline">Help</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-red-50 hover:text-red-500 group"
          style={{ fontSize: '13px', color: '#64748B' }}
        >
          <X size={13} className="group-hover:text-red-500" />
          <span className="hidden sm:inline group-hover:text-red-500">Exit</span>
        </button>
      </div>
    </header>
  );
}
