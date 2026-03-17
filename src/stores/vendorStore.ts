import { create } from 'zustand';

interface VendorFilters {
  search: string;
  stage: string;
  risk: string;
}

interface VendorState {
  selectedSupplierId: string | null;
  filters: VendorFilters;
  setFilters: (filters: Partial<VendorFilters>) => void;
  selectSupplier: (id: string | null) => void;
}

export const useVendorStore = create<VendorState>((set) => ({
  selectedSupplierId: null,
  filters: { search: '', stage: 'All', risk: 'All' },
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  selectSupplier: (id) => set({ selectedSupplierId: id }),
}));
