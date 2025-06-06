"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownToLine, CircleStop, Dot, Eye, EyeOff, Grip, Move, MoveDiagonal2, Play, X } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useCStackStore } from "@/store/cstack";
import { useChatsStore } from "@/store/chats";
import CStackViewer from "./cstack";
import { Button } from "../ui/button";
import { useSettingsStore } from "@/store/settings";
import { HTMLToLML } from "@/utils/html2lml";
import {
    DndContext,
    useDraggable,
    DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const DraggablePanel = ({
    children,
    position,
}: {
    children: React.ReactNode;
    position: { x: number; y: number };
}) => {
    const { setNodeRef, transform, attributes, listeners } = useDraggable({
        id: "cstack-viewer",
    });

    const [size, setSize] = useState({ width: 400, height: 300 });
    const panelRef = useRef<HTMLDivElement | null>(null);
    const resizingRef = useRef(false);

    const finalTransform = {
        x: position.x + (transform?.x ?? 0),
        y: position.y + (transform?.y ?? 0),
    };

    const style = {
        width: `${size.width}px`,
        transform: CSS.Translate.toString(finalTransform),
        position: "fixed",
        zIndex: 30,
    };

    const startResize = (e: React.MouseEvent) => {
        e.preventDefault();
        resizingRef.current = true;

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!resizingRef.current) return;
            const newWidth = startWidth + (moveEvent.clientX - startX);
            const newHeight = startHeight + (moveEvent.clientY - startY);

            setSize({
                width: Math.max(newWidth, 200),
                height: Math.max(newHeight, 200),
            });
        };

        const onMouseUp = () => {
            resizingRef.current = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
        >
            <div
                ref={panelRef}
                className="p-0 bg-card shadow-lg rounded-lg w-full h-full flex flex-col relative"
            >
                <div
                    className="bg-muted p-2 cursor-move font-medium text-sm rounded-t-lg drag-handle flex flex-row items-center gap-2"
                    {...attributes}
                    {...listeners}
                >
                    <Grip />
                    <span>Chat Preview</span>
                </div>

                <div className="flex-1">{children}</div>

                {/* Resize Handle */}
                <div
                    onMouseDown={startResize}
                    className="absolute bottom-1 right-1 w-4 h-4 bg-transparent cursor-nwse-resize"
                >
                    <MoveDiagonal2 size={15} />
                </div>
            </div>
        </div>
    );
};


type ChatBoxProps = {
    sendMessage: (data: { message: string; sender: string }) => void;
    handleCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    initMessage?: string;
    onTyping?: (data: { message: string; sender: string }) => Promise<void>;
    debounceDelay?: number;
    saveMessage?: (data: { message: string; sender: string }) => void;
    preview_position?: { x: number; y: number };
};

const estimateRows = (message: string, charsPerLine: number = 50): number => {
    if (!message) return 1;
    const lines = message.split('\n');
    let totalRows = 0;
    for (const line of lines) {
        totalRows += line.length === 0 ? 1 : Math.ceil(line.length / charsPerLine);
    }
    return 4 //Math.max(1, Math.min(totalRows, 8));
};

const useDebounce = (callback: (value: string) => void, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const debouncedCallback = useCallback((value: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => callback(value), delay);
    }, [callback, delay]);

    useEffect(() => () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    return debouncedCallback;
};

export const ChatBox = ({
    sendMessage,
    handleCancel,
    initMessage = "",
    onTyping = async () => { },
    debounceDelay = 1000,
    saveMessage = async () => { },
    preview_position = { x: 100, y: -500 }
}: ChatBoxProps) => {
    const [newMessage, setNewMessage] = useState(initMessage);
    const [isTyping, setIsTyping] = useState(false);
    const [preview, setPreview] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const CStackRef = useRef<HTMLDivElement | null>(null);
    const initialRows = estimateRows(initMessage);
    const [current, setCurrent] = useState(0);

    const { streaming, abortController } = useChatsStore();
    const { YOLO, live, setSettings } = useSettingsStore();
    const { remove } = useCStackStore();

    const converterRef = useRef(new HTMLToLML({
        preserveWhitespace: false,
        includeImages: true,
        includeLinks: true,
        includeTables: true,
        codeLanguage: 'lugha'
    }));

    useEffect(() => {
        textareaRef.current?.focus();
        if (textareaRef.current && initMessage) {
            textareaRef.current.style.height = `${Math.max(40, initialRows * 24)}px`;
        }
    }, [initMessage, initialRows]);

    const debouncedOnTyping = useDebounce(async (message: string) => {
        setIsTyping(false);
        abortController();
        await onTyping({ message, sender: "user" });
    }, debounceDelay);

    const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNewMessage(value);
        setIsTyping(true);
        debouncedOnTyping(value);

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "40px";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
    }, [debouncedOnTyping]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = useCallback(async () => {
        if (newMessage.trim() === "") return;
        const wrappedMessage = `p { \`${newMessage}\` }`;
        setNewMessage("");
        try {
            await sendMessage({ message: wrappedMessage, sender: "user" });
        } catch (err: any) {
            if (err.name !== "AbortError") console.error(err);
        }
        if (textareaRef.current) textareaRef.current.style.height = "40px";
    }, [newMessage, sendMessage]);

    const getHTML = (): string => CStackRef.current?.innerHTML || '';

    const getLML = (): string => {
        const html = getHTML();
        return html ? converterRef.current.convert(html) : '';
    };

    const handleSaveInChat = async () => {
        if (newMessage.trim() === "") return;

        setNewMessage("");

        const prompt = `p { \`${newMessage}\` }`;
        await saveMessage({ message: prompt, sender: "user" });
        const message = getLML();
        await saveMessage({ message, sender: "assistant" });
        remove(current);
    };

    const [panelPosition, setPanelPosition] = useState(preview_position);

    const handleDragEnd = (event: DragEndEvent) => {
        const { delta } = event;
        setPanelPosition((prev) => ({
            x: prev.x + delta.x,
            y: prev.y + delta.y,
        }));
    };


    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-2 w-full">
                {preview && (
                    <DraggablePanel position={panelPosition}>
                        <CStackViewer ref={CStackRef} current={current} setCurrent={setCurrent} />
                    </DraggablePanel>
                )}
                <div className="bg-card w-full rounded-4xl p-2 flex flex-col gap-2">
                    <div className="flex justify-between">
                        {live ? (
                            <Button variant="ghost" onClick={() => setPreview(!preview)}>
                                Preview {preview ? <EyeOff /> : <Eye />}
                            </Button>

                        ) : (
                            <div></div>
                        )}
                        <div className="flex gap-1">
                            <Dot size={20} className={isTyping ? "text-sky-500" : "text-foreground"} />
                            <Dot size={20} className={streaming ? "text-red-500" : "text-foreground"} />
                        </div>
                    </div>

                    <div className="flex items-end w-full gap-2">
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={newMessage}
                                onChange={handleTextareaChange}
                                onKeyDown={handleKeyPress}
                                placeholder="Type an instruction"
                                className="w-full py-2 px-4 pr-12 rounded-lg focus:outline-none resize-none overflow-auto"
                                style={{ height: "40px", maxHeight: "300px", minHeight: "40px" }}
                                aria-label="Message input"
                            />
                        </div>

                        {streaming ? (
                            <button
                                onClick={abortController}
                                className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-700 focus:outline-none mb-1"
                                aria-label="Cancel"
                            >
                                <CircleStop />
                            </button>
                        ) : live ? (
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSaveInChat}
                                    className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-700 focus:outline-none mb-1"
                                    aria-label="Save to chat"
                                >
                                    <ArrowDownToLine />
                                </Button>
                                <Button
                                    onClick={() => { }}
                                    className="bg-indigo-500 text-white rounded-full p-2 hover:bg-red-700 focus:outline-none mb-1"
                                    aria-label="Save and run"
                                >
                                    <Play />
                                </Button>
                            </div>
                        ) : (
                            <button
                                onClick={handleSend}
                                className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-700 focus:outline-none mb-1"
                                aria-label="Send message"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}

                        {handleCancel && (
                            <Button
                                onClick={handleCancel}
                                className="bg-red-500 text-white rounded-full p-2 hover:bg-red-700 focus:outline-none mb-1"
                                aria-label="Cancel"
                            >
                                <X />
                            </Button>
                        )}
                    </div>

                    <div className="p-2 flex gap-4">
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="live-mode">Live</Label>
                            <Switch
                                checked={live}
                                onCheckedChange={(e) => setSettings("live", e)}
                                id="live-mode"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="yolo-mode">YOLO</Label>
                            <Switch
                                checked={YOLO}
                                onCheckedChange={(e) => setSettings("YOLO", e)}
                                id="yolo-mode"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DndContext>
    );
};
