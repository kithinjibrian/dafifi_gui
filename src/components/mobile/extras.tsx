"use client"

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { useEffect, useState } from "react"
import { Extras, set_dialog } from "../utils/extras";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { useExtrasStore } from "@/store/extras";


export function ExtrasSM() {
    const { save, close } = useExtrasStore();

    const [open, setOpen] = useState(false);

    useEffect(() => {
        set_dialog(setOpen);
    }, []);

    const handleSave = async () => {
        if (save)
            await save()

        setOpen(false)
    };

    const handleCancel = async () => {
        if (close)
            await close()

        setOpen(false)
    };

    return (
        <Drawer
            open={open}
            onOpenChange={setOpen}
            dismissible={false}
        >
            <DrawerContent className="h-screen">
                <DrawerHeader className="flex flex-row justify-end border-b">
                    <DrawerTitle className="h-0 p-0 m-0 overflow-hidden">Extras</DrawerTitle>
                    <Button className="rounded-full" variant="ghost" onClick={handleCancel}>
                        <X />
                    </Button>
                </DrawerHeader>
                <div className="h-[calc(100%-48px)]">
                    <Extras />
                </div>
            </DrawerContent>
        </Drawer>
    )
}
