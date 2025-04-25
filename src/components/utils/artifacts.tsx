import Editor from '@monaco-editor/react';
import { useArtifactStore } from "@/store/artifact";
import { JSX, RefObject } from "react";
import { useTextStore } from '@/store/text';

export interface PanelRef {
    expand: () => void;
    collapse: () => void;
}

let panel: RefObject<PanelRef | null> = { current: null };

type ArtifactType = {
    artifact: 'home' | 'coder',
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

export const open_md_artifact = () => {
    if (panel.current) panel.current.expand();
};

export const open_sm_artifact = () => {
    if (fun) fun(true);
}

export const open_artifact = (device: boolean, artifact: ArtifactType) => {
    const set = useArtifactStore.getState().set;

    set(artifact);

    if (device) {
        open_sm_artifact();
    } else {
        open_md_artifact();
    }
}

export const artifacts: Record<string, (props: any) => JSX.Element> = {
    home: () => (
        <div>
        </div>
    ),
    coder: () => {
        const { read } = useTextStore.getState();

        return (
            <div>
                Code editor not available to mobile at the moment.
            </div>
        )
    }
    ,
};