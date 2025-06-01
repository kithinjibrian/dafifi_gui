"use client"

import { useEffect, useState } from "react"
import { Extras, set_dialog } from "../utils/extras";
import { useExtrasStore } from "@/store/extras";
import { EditorBtns } from "../chat/extras/editor";
import { CodeBtns } from "../chat/extras/code";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

type ExtrasComponent = React.FC<{ isMobile: boolean, setOpen: (value: boolean) => void }>;

const buttons: Record<string, ExtrasComponent> = {
    Editor: EditorBtns,
    Code: CodeBtns,
    Server: () => <></>,
    Cronjobs: () => <></>,
    Array: () => <></>,
    Map: () => <></>,
};


export function ExtrasSM() {
    const [Component, setComponent] = useState<ExtrasComponent | null>(null);
    const { menu } = useExtrasStore();

    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (typeof set_dialog === 'function') {
            set_dialog(setOpen);
        }
    }, []);

    useEffect(() => {
        const Comp = buttons[menu];
        setComponent(() => Comp ?? null);
    }, [menu]);

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogContent className="sm:max-w-screen max-w-screen h-screen p-0">
                <DialogHeader className="flex flex-col gap-2 text-center sm:text-left">
                    <DialogTitle>Extras</DialogTitle>
                    {Component && <Component isMobile={true} setOpen={setOpen} />}
                </DialogHeader>
                <div className="h-[calc(100%-48px)] border-t">
                    <Extras />
                </div>
            </DialogContent>
        </Dialog>
    )
}