import { useEffect, useRef, useState, RefObject } from 'react';
import { Button } from '../ui/button';
import { Extras, PanelRef, set_panel } from '../utils/extras';
import { X } from 'lucide-react';
import { useExtrasStore } from '@/store/extras';

export const ExtrasMD = ({ panelRef }: { panelRef: RefObject<PanelRef | null> }) => {
    const { save, close } = useExtrasStore();
    const [content, setContent] = useState('');

    useEffect(() => {
        if (panelRef?.current) {
            set_panel(panelRef);
            panelRef.current.collapse();
        }
    }, [panelRef]);

    const handleSave = async () => {
        if (save)
            await save()

        if (panelRef?.current) {
            panelRef.current.collapse();
        }
    };

    const handleCancel = async () => {
        if (close)
            await close()

        if (panelRef?.current) {
            panelRef.current.collapse();
        }
    };

    return (
        <div className="h-full w-full">
            <div className="flex gap-2 justify-end p-2 border-b">
                <Button className="rounded-full" variant="ghost" onClick={handleCancel}>
                    <X />
                </Button>
            </div>
            <div className="h-[calc(100%-48px)]">
                <Extras />
            </div>
        </div>
    );
};

