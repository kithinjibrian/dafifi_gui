import { useChatsStore } from "@/store/chats";
import { MessageList } from "./message";
import { useCallback, useEffect, useRef } from "react";
import { ChatBox } from "./chat-box";
import { useParams, useRouter } from "next/navigation";


export const MainArea = ({ panelRef }: { panelRef: React.RefObject<any> | null }) => {
    const router = useRouter();
    const params = useParams<{ slug: string }>();

    const {
        active,
        fetchChat,
        sendMessageWrap
    } = useChatsStore();

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
        if (!active || active.id !== params.slug) {
            fetchChat(params.slug, () => { }).catch(() => router.push("/"));
        }
    }, [params.slug, active, fetchChat, router]);

    return (
        <div className="relative flex flex-col h-[95%] md:h-full w-full pt-10 md:pt-5">
            {active && (
                <MessageList
                    messages={active.messages}
                    messagesEndRef={messagesEndRef}
                />
            )}
            <div className="fixed bottom-0 md:relative w-full flex flex-col p-1 shadow-lg items-center bg-background">
                <ChatBox sendMessage={sendMessageWrap} />
                <div className="flex m-2">
                </div>
            </div>
        </div>
    );
}