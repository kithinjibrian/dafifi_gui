"use client"

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { useEffect, useState } from "react"
import { artifacts, set_dialog } from "../utils/artifacts";
import { Button } from "../ui/button";
import { useArtifactStore } from "@/store/artifact";


export function MobileArtifact() {
    const { artifact, save, close } = useArtifactStore();

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
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="flex flex-row justify-end">
                        <DrawerTitle className="h-0 p-0 m-0 overflow-hidden">Artifacts</DrawerTitle>
                        <Button className="rounded-full" onClick={handleSave}>
                            Save
                        </Button>
                        <Button className="rounded-full" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </DrawerHeader>

                    <div className="h-[calc(100%-48px)]">
                        {artifact in artifacts
                            ? artifacts[artifact]({})
                            : <div className="p-4 text-center text-muted-foreground">Unknown artifact type</div>}
                    </div>
                    
                </div>
            </DrawerContent>
        </Drawer>
    )
}
