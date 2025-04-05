import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import React from "react";

export interface PanelProps {
    id: number;
    minSize?: number;
    maxSize?: number;
    content?: Function;
    defaultSize?: number;
    collapsible?: boolean;
    collapsedSize?: number;
    children?: PanelProps[];
    direction?: 'horizontal' | 'vertical';
}

interface RenderPanelsProps {
    panels: PanelProps[];
    direction?: 'horizontal' | 'vertical';
}

export const RenderPanels: React.FC<RenderPanelsProps> = ({ panels, direction = 'horizontal' }) => {
    return (
        <ResizablePanelGroup direction={direction}>
            {panels.map(({ id, content, children, direction, ...props }, index) => (
                <React.Fragment key={id}>
                    {children ? (

                        <ResizablePanel {...props}>
                            <RenderPanels panels={children} direction={direction} />
                        </ResizablePanel>
                    ) : (

                        <ResizablePanel {...props}>
                            {content && content()}
                        </ResizablePanel>
                    )}
                    {index < panels.length - 1 && <ResizableHandle className="hover:bg-sky-500" />}
                </React.Fragment>
            ))}
        </ResizablePanelGroup>
    )
}