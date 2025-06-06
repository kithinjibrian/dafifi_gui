"use client"

import { useChatsStore } from "@/store/chats";
import { MessageList } from "./message";
import { useCallback, useEffect, useRef } from "react";
import { ChatBox } from "./chat-box";
import { useParams, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { open_extras } from "../utils/extras";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";
import { useCStackStore } from "@/store/cstack";
import { Message, useMessageStore } from "@/store/message";


export const MainArea = ({ panelRef }: { panelRef: React.RefObject<any> | null }) => {
    const isMobile = useIsMobile();
    const router = useRouter();
    const params = useParams<{ slug: string }>();

    const {
        active,
        fetchChat,
        sendMessageWrap,
        sendMessage,
        setStreaming
    } = useChatsStore();

    const { saveMessage } = useMessageStore();

    const { append, new_message } = useCStackStore();

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (active?.messages) {
            scrollToBottom();
        }
    }, [active?.messages, scrollToBottom]);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const el = document.getElementById(hash.substring(1)); // remove "#"
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, []);

    useEffect(() => {
        if (!active || active.id !== params.slug) {
            fetchChat(params.slug, () => { }).catch(() => router.push("/"));
        }
    }, [params.slug, active, fetchChat, router]);

    return (
        <div className="flex flex-col md:h-full pt-10 md:pt-2">
            <div className="flex-1 overflow-y-auto">
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            open_extras(isMobile, {
                                menu: "Editor",
                                save: () => { },
                            })
                        }}>
                        <Menu />
                    </Button>
                </div>
                {active && (
                    <MessageList
                        messages={active.messages}
                        messagesEndRef={messagesEndRef}
                    />
                )}
            </div>
            <div className="flex flex-col bg-background px-2 w-full items-center">
                <ChatBox
                    sendMessage={sendMessageWrap}
                    onTyping={async (msg: any) => {
                        if (msg.message == "") return;

                        setStreaming(true);

                        new_message();

                        await sendMessage(
                            { ...msg, transient: true, chat_id: active?.id },
                            () => { },
                            (message_id: string, message: string) => {
                                append(message);
                            },
                            () => { }
                        );

                        setStreaming(false);
                    }}
                    saveMessage={saveMessage}
                />
                <div className="flex m-2">
                </div>
            </div>
        </div>
    );
}