import { create } from 'zustand';
import type { Category } from '@/types/shared';

interface ControlFilters {
  search: string;
  personality: string;
  category: string;
}

interface ControlState {
  activeTab: 'Process' | 'Document' | 'Technical';
  filters: ControlFilters;
  setActiveTab: (tab: 'Process' | 'Document' | 'Technical') => void;
  setFilters: (filters: Partial<ControlFilters>) => void;
}

export const useControlStore = create<ControlState>((set) => ({
  activeTab: 'Process',
  filters: { search: '', personality: 'All', category: 'All' },
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
}));
