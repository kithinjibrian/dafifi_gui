import { StateCreator } from "zustand";

export interface TabStore {
    activeTab: string,
    setActiveTab: (tab: string) => void,
}

export const createTabSlice: StateCreator<
    TabStore,
    [],
    [],
    TabStore
> = (set: any, get: any) => ({
    activeTab: "New Chat",
    setActiveTab: (tab: string) => {
        set({ activeTab: tab })
    }
})