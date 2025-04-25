import { create } from "zustand";

export const useArtifactStore =
    create<any>((set, get) => ({
        artifact: "home",
        save: () => { },
        close: () => { },
        set: ({
            artifact,
            save,
            close
        }: {
            artifact: string,
            save?: Function,
            close?: Function
        }) => {
            set({ artifact, save, close })
        }
    }))