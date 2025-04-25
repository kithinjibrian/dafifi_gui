import { create } from "zustand";

export const useTextStore =
    create<any>((set, get) => ({
        text: null,
        write: (text: string) => {
            set({ text })
        },
        read: () => {
            return get().text;
        }
    }))