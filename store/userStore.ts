import { create } from "zustand";
import { UserRole } from "@/types";

interface User {
  _id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  users: User[];
  isLoading: boolean;

  // Actions
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setLoading: (loading: boolean) => void;
  getUsersByRole: (role: UserRole) => User[];
  getUsersByManager: (managerId: string) => User[];
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,

  setUsers: (users: User[]) => set({ users }),

  addUser: (user: User) =>
    set((state) => ({ users: [...state.users, user] })),

  updateUser: (id: string, updates: Partial<User>) =>
    set((state) => ({
      users: state.users.map((user) =>
        user._id === id ? { ...user, ...updates } : user
      ),
    })),

  deleteUser: (id: string) =>
    set((state) => ({
      users: state.users.filter((user) => user._id !== id),
    })),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  getUsersByRole: (role: UserRole) => {
    return get().users.filter((user) => user.role === role);
  },

  getUsersByManager: (managerId: string) => {
    return get().users.filter((user) => user.managerId === managerId);
  },
}));
