import { useCallback, useEffect, useRef, useState } from "react";
import { CircleStop, Dot, Eye, X } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useCStackStore } from "@/store/cstack";
import { useChatsStore } from "@/store/chats";
import { Message } from "react-hook-form";
import CStackViewer from "./cstack";
import { Button } from "../ui/button";


type ChatBoxProps = {
    sendMessage: (data: { message: string; sender: string }) => void;
    handleCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    initMessage?: string;
    onTyping?: (data: { message: string; sender: string }) => Promise<void>;
    debounceDelay?: number;
};

const estimateRows = (message: string, charsPerLine: number = 50): number => {
    if (!message) return 1;

    const lines = message.split('\n');
    let totalRows = 0;

    for (const line of lines) {
        if (line.length === 0) {
            totalRows += 1;
        } else {
            totalRows += Math.ceil(line.length / charsPerLine);
        }
    }

    return 4; //Math.max(1, Math.min(totalRows, 8)); // Min 1 row, max 8 rows
};

const useDebounce = (callback: (value: string) => void, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedCallback = useCallback((value: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
            await callback(value);
        }, delay);
    }, [callback, delay]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

export const ChatBox = ({
    sendMessage,
    handleCancel,
    initMessage = "",
    onTyping = async () => { },
    debounceDelay = 1000
}: ChatBoxProps) => {
    const [newMessage, setNewMessage] = useState(initMessage);
    const [isTyping, setIsTyping] = useState(false);
    const [preview, setPreview] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const initialRows = estimateRows(initMessage);
    const [currentRows, setCurrentRows] = useState(initialRows);

    const { streaming, abortController } = useChatsStore();

    useEffect(() => {
        textareaRef.current?.focus();

        if (textareaRef.current && initMessage) {
            const estimatedHeight = Math.max(40, initialRows * 24); // ~24px per row
            textareaRef.current.style.height = `${estimatedHeight}px`;
        }

    }, []);

    const handleSend = async () => {
        if (newMessage.trim() === "") return;

        setNewMessage("");

        try {
            await sendMessage({
                message: `p { \`${newMessage}\` }`,
                sender: "user",
            });
        } catch (err: any) {
            if (err.name === "AbortError") {
                console.log("Request aborted");
            } else {
                console.error(err);
            }
        }

        if (textareaRef.current) {
            textareaRef.current.style.height = "40px";
        }
    };

    const debouncedOnTyping = useDebounce(async (message: string) => {
        setIsTyping(false);

        abortController();

        await onTyping({
            message,
            sender: "user"
        });

    }, debounceDelay);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;

        setNewMessage(value);

        setIsTyping(true);

        debouncedOnTyping(value);

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "40px";
            const scrollHeight = textarea.scrollHeight;

            if (scrollHeight <= 150) {
                textarea.style.height = scrollHeight + "px";
            } else {
                textarea.style.height = "150px";
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {preview && (
                <CStackViewer />
            )}
            <div className="bg-card w-full rounded-4xl p-2 flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <Button
                        variant={"ghost"}
                        onClick={() => setPreview(!preview)}>
                        Preview
                        <Eye />
                    </Button>
                    <div className="flex flex-row">
                        <Dot size={20} className={isTyping ? "text-sky-500" : "text-foreground"} />
                        <Dot size={20} className={streaming ? "text-red-500" : "text-foreground"} />
                    </div>
                </div>
                <div className="flex flex-row items-end w-full gap-2" style={{ alignItems: 'flex-end' }}>
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={newMessage}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyPress}
                            placeholder="Type an instruction"
                            className="w-full py-2 px-4 pr-12 rounded-lg focus:outline-none resize-none overflow-auto"
                            style={{ height: "40px", maxHeight: "300px", minHeight: "40px" }}
                            rows={currentRows}
                            aria-label="Message input"
                        />
                    </div>

                    {streaming ? (
                        <>
                            <button
                                onClick={() => {
                                    abortController();
                                }}
                                className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-700 focus:outline-none mb-1"
                                aria-label="Cancel"
                            >
                                <CircleStop />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleSend}
                            className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-700 focus:outline-none mb-1"
                            aria-label="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {handleCancel !== undefined && (
                        <button
                            onClick={handleCancel}
                            className="bg-red-500 text-white rounded-full p-2 hover:bg-red-700 focus:outline-none mb-1"
                            aria-label="Cancel"
                        >
                            <X />
                        </button>
                    )}
                </div>

                <div className="p-2 flex flex-row gap-2">
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="live-mode">Live</Label>
                        <Switch id="live-mode" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="yolo-mode">YOLO</Label>
                        <Switch id="yolo-mode" />
                    </div>
                </div>
            </div>
        </div >
    );
};
