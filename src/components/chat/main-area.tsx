import { useChatsStore } from "@/store/chats";
import { MessageList } from "./message";
import { useCallback, useEffect, useRef } from "react";
import { ChatBox } from "./chat-box";
import { Message } from "@/store/message";
import { useParams, useRouter } from "next/navigation";


export const MainArea = ({ panelRef }: { panelRef: React.RefObject<any> | null }) => {
    const router = useRouter();
    const params = useParams<{ slug: string }>();

    const {
        active,
        sendMessage,
        pushMessage,
        fetchChat
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

    const handleSendMessage = useCallback(async (msg: Message) => {
        if (!active) return;

        const handleHeader = async (data: any) => {
            pushMessage({ ...msg, id: data.umessage_id });
            pushMessage({
                id: data.imessage_id,
                sender: "assistant",
                message: "",
                mock: true,
            });
        };

        try {
            await sendMessage(
                { ...msg, chat_id: active.id },
                handleHeader,
                () => { }
            );
            return "success";
        } catch (err) {
            console.error("Error sending message:", err);
            return "error";
        }
    },
        [pushMessage, sendMessage, active]
    );

    return (
        <div className="relative flex flex-col h-[95%] md:h-full w-full pt-10 md:pt-30">
            {active && (
                <MessageList
                    messages={active.messages}
                    messagesEndRef={messagesEndRef}
                />
            )}
            <div className="fixed md:relative bottom-0 flex p-1 w-full shadow-lg justify-center bg-background">
                <ChatBox sendMessage={handleSendMessage} />
            </div>
        </div>
    );
}