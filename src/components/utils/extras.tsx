import { RefObject } from "react";
import { NavBarExtras } from "../chat/extras/nav-bar-extras";
import { useExtrasStore } from "@/store/extras";

export interface PanelRef {
    expand: () => void;
    collapse: () => void;
}

let panel: RefObject<PanelRef | null> = { current: null };

type ExtrasType = {
    menu: 'Editor' | 'Code',
    save?: Function,
    close?: Function
};

export const set_panel = (panelRef: RefObject<PanelRef | null>) => {
    panel = panelRef
}

let fun: Function | null = null;

export const set_dialog = (set_fun: Function) => {
    fun = set_fun
}

export const open_md_extras = () => {
    if (panel.current) panel.current.expand();
};

export const open_sm_extras = () => {
    if (fun) fun(true);
}

export const open_extras = (device: boolean, extras: ExtrasType) => {
    const set = useExtrasStore.getState().set;

    set(extras);

    if (device) {
        open_sm_extras();
    } else {
        open_md_extras();
    }
}

export const Extras = () => {
    return (
        <NavBarExtras />
    )
};