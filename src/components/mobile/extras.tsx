"use client"

import { useEffect, useState } from "react"
import { Extras, set_dialog } from "../utils/extras";
import { useExtrasStore } from "@/store/extras";
import { EditorBtns } from "../chat/extras/editor";
import { CodeBtns } from "../chat/extras/code";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { X } from "lucide-react";

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
                <DialogHeader className="flex flex-col">
                    <div>
                        <DialogTitle>Extras</DialogTitle>
                    </div>
                    <div className="flex flex-row gap-2">
                        {Component && <Component isMobile={true} setOpen={setOpen} />}
                        <Button className="rounded-full" variant="ghost" onClick={() => setOpen(false)}>
                            Close
                            <X />
                        </Button>
                    </div>
                </DialogHeader>
                <div className="h-[calc(100%-48px)] border-t">
                    <Extras />
                </div>
            </DialogContent>
        </Dialog>
    )
}