import { useEffect, useRef, useState, RefObject } from 'react';
import { Button } from '../ui/button';
import { useArtifactStore } from '@/store/artifact';
import { artifacts, PanelRef, set_panel } from '../utils/artifacts';

export const Artifact = ({ panelRef }: { panelRef: RefObject<PanelRef | null> }) => {
    const { artifact, save, close } = useArtifactStore();
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
            <div className="flex gap-2 justify-end p-2">
                <Button className="rounded-full" onClick={handleSave}>
                    Save
                </Button>
                <Button className="rounded-full" variant="outline" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
            <div className="h-[calc(100%-48px)]">
                {artifact in artifacts
                    ? artifacts[artifact]({})
                    : <div className="p-4 text-center text-muted-foreground">Unknown artifact type</div>}
            </div>
        </div>
    );
};
