import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Modal({ title, subtitle, onClose, children, footer, width = 680 }: ModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div
        className="relative max-h-[88vh] bg-white rounded-2xl flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.2)] z-[1]"
        style={{ width }}
      >
        {/* Header */}
        <div className="px-7 pt-5 pb-4 border-b border-slate-200 shrink-0 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">{title}</h2>
            {subtitle && <div className="text-sm text-slate-400">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-7 py-3.5 border-t border-slate-200 shrink-0 bg-slate-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
