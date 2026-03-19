import { ReactNode } from 'react';

interface DataTableProps {
  headers: string[];
  children: ReactNode;
  totalCount: number;
  filteredCount: number;
  className?: string;
}

export function DataTable({ headers, children, totalCount, filteredCount, className = '' }: DataTableProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              {headers.map(h => (
                <th
                  key={h}
                  className="px-3.5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left whitespace-nowrap bg-slate-50"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
        <span className="text-[13px] text-slate-500">
          Showing {filteredCount} of {totalCount}
        </span>
        <div className="flex gap-1.5">
          <button className="text-[13px] text-slate-500 bg-white border border-slate-200 rounded-md px-3 py-1.5 cursor-pointer hover:bg-slate-50">
            Prev
          </button>
          <button className="text-[13px] text-slate-500 bg-white border border-slate-200 rounded-md px-3 py-1.5 cursor-pointer hover:bg-slate-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
