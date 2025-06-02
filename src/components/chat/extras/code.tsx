import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PanelRef } from "@/components/utils/extras";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatsStore } from "@/store/chats";
import { useTextStore } from "@/store/text"
import { HTMLToLML } from "@/utils/html2lml";
import { ReactED } from "@/utils/react2";
import { Save } from "lucide-react";
import { RefObject, use, useEffect, useReducer, useRef, useState } from "react";
import { renderToString, renderToStaticMarkup } from 'react-dom/server';

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

export const CodeBtns = (args: {
    panelRef?: RefObject<PanelRef | null>,
    isMobile?: boolean,
    setOpen?: (open: boolean) => void
}) => {
    if (!args) return null;

    const { panelRef, isMobile, setOpen } = args;

    const { text } = useTextStore();
    const { active, editMessage, refreshChat } = useChatsStore();

    if (!text) return <></>

    const collapsePanel = () => {
        if (isMobile) {
            setOpen && setOpen(false);
        } else {
            if (panelRef?.current) {
                panelRef.current.collapse();
            }
        }
    };

    const handleSave = async () => {
        await editMessage({
            id: text.id,
            message: text.message,
        });

        await refreshChat();

        collapsePanel();
    }

    return (
        <>
            <Button
                className="rounded-full"
                variant="ghost"
                onClick={handleSave}
            >
                Save
                <Save />
            </Button>
        </>
    )
}

export const CodeEd = () => {
    const [store, dispatch] = useReducer(reducer, { hideCode: [] });
    const [renderedComponents, setRenderedComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { text, write } = useTextStore();
    const contentRef = useRef(null);

    const converter = new HTMLToLML({
        preserveWhitespace: false,
        includeImages: true,
        includeLinks: true,
        includeTables: true,
        codeLanguage: 'lugha'
    });

    const converterRef = useRef(new HTMLToLML({
        preserveWhitespace: false,
        includeImages: true,
        includeLinks: true,
        includeTables: true,
        codeLanguage: 'lugha'
    }));

    if (!text) return <div className="p-4 text-gray-500">No code to render</div>;

    useEffect(() => {
        let isCancelled = false;

        const processCode = async () => {
            if (!text.message.trim()) return;

            setIsLoading(true);
            setError(null);

            try {
                const reactEditor = new ReactED(text);
                const { react } = await reactEditor.run();

                if (!isCancelled) {
                    setRenderedComponents(react);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err.message || 'Failed to render components');
                    setRenderedComponents([]);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        processCode();

        return () => {
            isCancelled = true;
        };
    }, [text, store.hideCode]);

    if (isLoading) {
        return (
            <div className="h-full w-full p-2 flex items-center justify-center">
                <div className="text-gray-500">Processing code...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full p-2">
                <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    const getHTML = (): string => contentRef.current?.innerHTML || '';

    const getLML = (): string => {
        const html = getHTML();
        return html ? converterRef.current.convert(html) : '';
    };

    return (
        <div className="h-full w-full p-2">
            <ScrollArea className="h-9/10 w-full">
                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning={true}
                    className="outline-none min-h-full"
                    role="textbox"
                    aria-label="Code editor output"
                    onInput={(e) => {
                        text.message = getLML();
                        write(text);
                    }}
                >
                    {renderedComponents}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};