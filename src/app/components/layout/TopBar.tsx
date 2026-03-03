import { Bell } from 'lucide-react';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <div
      style={{
        height: 64,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        flexShrink: 0,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B',
            padding: 6,
            borderRadius: 8,
          }}
          className="hover:bg-[#F1F5F9] hover:text-[#0F172A]"
        >
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              border: '2px solid white',
            }}
          />
        </button>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#0EA5E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          PS
        </div>
      </div>
    </div>
  );
}
