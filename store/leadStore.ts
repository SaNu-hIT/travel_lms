import { create } from "zustand";
import { LeadStatus, LeadSource } from "@/types";

interface Lead {
  _id: string;
  tenantId: string;
  assignedToId?: string;
  status: LeadStatus;
  source: LeadSource;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  assignedToId?: string;
  search?: string;
}

interface LeadState {
  leads: Lead[];
  filters: LeadFilters;
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // Actions
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setFilters: (filters: LeadFilters) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: Partial<LeadState["pagination"]>) => void;
}

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  filters: {},
  isLoading: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  setLeads: (leads: Lead[]) => set({ leads }),

  addLead: (lead: Lead) =>
    set((state) => ({ leads: [lead, ...state.leads] })),

  updateLead: (id: string, updates: Partial<Lead>) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead._id === id ? { ...lead, ...updates } : lead
      ),
    })),

  deleteLead: (id: string) =>
    set((state) => ({
      leads: state.leads.filter((lead) => lead._id !== id),
    })),

  setFilters: (filters: LeadFilters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({ filters: {} }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),
}));
