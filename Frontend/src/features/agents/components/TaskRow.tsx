import { useState } from 'react';
import { MessageSquare, UserCheck, CalendarCheck, Send } from 'lucide-react';
import type { AgentTask, TaskStatus } from '../types';

export function TaskRow({ task, agentColor }: { task: AgentTask; agentColor: string }) {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [localStatus, setLocalStatus] = useState<TaskStatus>(task.status);

  const priorityCfg = {
    High:   { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
    Medium: { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
    Low:    { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  }[task.priority];

  const statusCfg = {
    Open:          { color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' },
    'In Progress': { color: '#0EA5E9', bg: '#EFF6FF', border: '#BAE6FD' },
    Resolved:      { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  }[localStatus];

  return (
    <div className="border border-slate-200 rounded-[10px] bg-white mb-2.5 py-3.5 px-4">
      <div className="flex items-start gap-2.5 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[13px] font-bold text-slate-900">{task.title}</span>
            <span
              className="text-[10px] font-bold rounded-full px-2 py-0.5"
              style={{ color: priorityCfg.color, backgroundColor: priorityCfg.bg, border: `1px solid ${priorityCfg.border}` }}
            >
              {task.priority}
            </span>
            <span
              className="text-[10px] font-semibold rounded-full px-2 py-0.5"
              style={{ color: statusCfg.color, backgroundColor: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}
            >
              {localStatus}
            </span>
          </div>
          <div className="text-xs text-slate-500 mb-1">{task.description}</div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] text-purple-500 bg-purple-50 rounded-[10px] font-medium px-2 py-0.5">
              {task.supplier}
            </span>
            {task.assignee ? (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <UserCheck size={11} />{task.assignee}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Unassigned</span>
            )}
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CalendarCheck size={11} />Due {task.dueDate}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5 shrink-0 flex-wrap">
          {localStatus !== 'In Progress' && localStatus !== 'Resolved' && (
            <button
              onClick={() => setLocalStatus('In Progress')}
              className="text-[11px] font-semibold px-3 py-[5px] rounded-[7px] border border-sky-200 bg-sky-50 text-sky-500 cursor-pointer"
            >
              Assign
            </button>
          )}
          {localStatus !== 'Resolved' && (
            <button
              onClick={() => setLocalStatus('Resolved')}
              className="text-[11px] font-semibold px-3 py-[5px] rounded-[7px] border border-emerald-200 bg-emerald-50 text-emerald-500 cursor-pointer"
            >
              Resolve
            </button>
          )}
          <button className="text-[11px] font-semibold px-3 py-[5px] rounded-[7px] border border-red-200 bg-red-50 text-red-500 cursor-pointer">
            Escalate
          </button>
          <button
            onClick={() => setShowComment((v) => !v)}
            className="text-[11px] font-semibold px-3 py-[5px] rounded-[7px] border border-slate-200 bg-slate-50 text-slate-500 cursor-pointer flex items-center gap-1"
          >
            <MessageSquare size={11} /> Comment
          </button>
        </div>
      </div>

      {showComment && (
        <div className="mt-3 flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment or note..."
            className="flex-1 border border-slate-200 rounded-[7px] text-xs text-slate-700 outline-none py-[7px] px-3"
          />
          <button
            onClick={() => { setComment(''); setShowComment(false); }}
            className="rounded-[7px] border-none text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 py-[7px] px-3.5"
            style={{ backgroundColor: agentColor }}
          >
            <Send size={11} /> Send
          </button>
        </div>
      )}
    </div>
  );
}
