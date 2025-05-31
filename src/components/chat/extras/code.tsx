import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTextStore } from "@/store/text"
import { ReactED } from "@/utils/react2";
import { useEffect, useReducer, useState } from "react";

function reducer(state, action) {
    switch (action.type) {
        case 'hideCode':
            const updatedHideCode = [...state.hideCode];
            updatedHideCode[action.index] = !updatedHideCode[action.index];
            return { ...state, hideCode: updatedHideCode };
        default:
            return state;
    }
}

export const CodeEd = () => {
    const isMobile = useIsMobile();
    const [store, dispatch] = useReducer(reducer, { hideCode: [] });
    const [renderedComponents, setRenderedComponents] = useState([]);
    const { text } = useTextStore();

    if (!text) return <></>

    useEffect(() => {
        let a = async () => {
            const { react } = await new ReactED(
                text,
            ).run();
            setRenderedComponents(react);
        };
        a();
    }, [text, isMobile, store.hideCode]);

    return (
        <div
            className='h-full w-full p-2'>
            <ScrollArea className="h-9/10 w-full">
                <div
                    contentEditable
                    suppressContentEditableWarning={true}
                    className="outline-none"
                >
                    {renderedComponents}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}