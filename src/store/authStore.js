import { create } from "zustand";
import { persist } from "zustand/middleware";
import { currentUser } from "../data/mockData";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: currentUser,
      token: "demo-session-token",
      isAuthenticated: true,
      login: (payload) =>
        set({
          user: {
            ...currentUser,
            email: payload.email || currentUser.email,
            role: payload.role || currentUser.role,
          },
          token: "demo-session-token",
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "nova_vms_auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
