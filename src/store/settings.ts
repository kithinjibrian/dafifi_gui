import { create } from "zustand";

export const useSettingsStore = create<any>((set, get) => ({
    YOLO: false,
    live: true,
    setSettings: (key: string, value: any) => {
        set({ [key]: value })
    }
}))