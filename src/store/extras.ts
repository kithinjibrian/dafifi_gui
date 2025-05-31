import { create } from "zustand";

export const useExtrasStore =
    create<any>((set, get) => ({
        menu: 'Editor',
        setMenu: (menu: 'Editor') => {
            set({ menu })
        },
        save: () => { },
        close: () => {
            set({})
        },
        set: ({
            menu,
            save,
            close
        }: {
            menu: 'Editor'
            save?: Function,
            close?: Function
        }) => {
            set({ menu, save, close })
        }
    }))