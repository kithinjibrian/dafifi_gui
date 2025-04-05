import { request } from "@/utils/request";
import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthStore {
    user: User | null;
    isHydrated: boolean;
    isAuthenticated: boolean;
    setHydrated: () => void;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isHydrated: false,
            setHydrated: () => set({ isHydrated: true }),
            login: async (username, password) => {
                try {
                    const response = await request.post('/auth/login',
                        { username, password }
                    );

                    set({
                        user: response.data.user,
                        isAuthenticated: true
                    });
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await request.post('/auth/logout', {});
                    set({ user: null, isAuthenticated: false });
                } catch (error) {
                    console.error('Logout failed', error);
                }
            },

            refreshToken: async () => {
                try {
                    await request.post('/auth/refresh', {});
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                    throw error;
                }
            }
        }),
        {
            name: 'auth-storage', // unique name
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated()
            },
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);