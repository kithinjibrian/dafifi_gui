import { useEffect, useRef, RefObject } from 'react';
import { Button } from '../ui/button';
import { Extras, PanelRef, set_panel } from '../utils/extras';
import { X } from 'lucide-react';
import { useExtrasStore } from '@/store/extras';
import { CodeBtns } from './extras/code';
import { EditorBtns } from './extras/editor';

const buttons: Record<string, any> = {
    Editor: EditorBtns,
    Code: CodeBtns,
    Server: () => <></>,
    Cronjobs: () => <></>,
    Array: () => <></>,
    Map: () => <></>,
};

export const ExtrasMD = ({ panelRef }: { panelRef: RefObject<PanelRef | null> }) => {
    const { menu, setMenu, save, close } = useExtrasStore();

    const collapsePanel = () => {
        if (panelRef?.current) {
            panelRef.current.collapse();
        }
    };

    useEffect(() => {
        if (panelRef?.current) {
            set_panel(panelRef);
            collapsePanel();
        }
    }, [panelRef]);

    const handleSave = async () => {
        if (save) await save();
        collapsePanel();
    };

    const handleCancel = async () => {
        if (close) await close();
        collapsePanel();
    };

    const Component = buttons[menu];

    return (
        <div className="h-full w-full">
            <div className="flex gap-2 justify-end p-2 border-b">
                {Component && <Component panelRef={panelRef} />}
                <Button className="rounded-full" variant="ghost" onClick={handleCancel}>
                    Close
                    <X />
                </Button>
            </div>
            <div className="h-[calc(100%-48px)]">
                <Extras />
            </div>
        </div>
    );
};