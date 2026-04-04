import { Bell } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 font-[Inter,sans-serif]">
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      <div className="flex items-center gap-4">
        <button className="relative bg-transparent border-0 cursor-pointer text-slate-500 p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>
        <div 
          className="w-9 h-9 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-[13px] font-bold cursor-pointer"
          title={user?.name || 'Profile'}
          onClick={() => navigate('/profile')}
        >
          {getInitials(user?.name)}
        </div>
      </div>
    </div>
  );
}
