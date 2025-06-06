import { useEffect, useRef, RefObject, useState } from 'react';
import { Button } from '../ui/button';
import { Extras, PanelRef, set_panel } from '../utils/extras';
import { X } from 'lucide-react';
import { useExtrasStore } from '@/store/extras';
import { CodeBtns } from './extras/code';
import { EditorBtns } from './extras/editor';

type ExtrasComponent = React.FC<{ panelRef?: RefObject<PanelRef | null> }>;

const buttons: Record<string, ExtrasComponent> = {
    Editor: EditorBtns,
    Code: CodeBtns,
    Computer: () => <></>,
    Server: () => <></>,
    Cronjobs: () => <></>,
    Array: () => <></>,
    Map: () => <></>,
};

export const ExtrasMD = ({ panelRef }: { panelRef: RefObject<PanelRef | null> }) => {
    const [Component, setComponent] = useState<ExtrasComponent | null>(null);
    const { menu } = useExtrasStore();

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

    useEffect(() => {
        const Comp = buttons[menu];
        setComponent(() => Comp ?? null);
    }, [menu]);

    return (
        <div className="h-full w-full">
            <div className="flex gap-2 justify-end p-2 border-b">
                {Component && <Component panelRef={panelRef} />}
                <Button className="rounded-full" variant="ghost" onClick={collapsePanel}>
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