import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, token) => {
        localStorage.setItem("accessToken", token);
        set({ user, accessToken: token });
      },
      logout: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, accessToken: null });
      },
    }),
    { name: "auth-storage" }
  )
);