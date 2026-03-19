import { create } from 'zustand';

interface AgentState {
  selectedAgentId: string | null;
  selectAgent: (id: string | null) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  selectedAgentId: null,
  selectAgent: (id) => set({ selectedAgentId: id }),
}));
