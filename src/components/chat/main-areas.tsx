import { useChatsStore } from "@/store/chats";
import { useCodeStore } from "@/store/code";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { ChatBox } from "./chat-box";
import { MessageList } from "./message";
import { Message } from "@/store/message";

export const MainAreas = () => {
    const router = useRouter();
    const params = useParams<{ slug: string }>();
    const { active, fetchChat, sendMessage, pushMessage, updateMessage, appendMessage, sendAction } = useChatsStore();
    const { get, set } = useCodeStore();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const triggerPendingExecutables = useCallback(() => {
        get({ key: "state", value: "PENDING" }).forEach(handleToolResponse);
    }, [get]);

    const handleEnd = useCallback(async () => {
        if (!active) return;
        const lastMessage = active.messages.at(-1);

        if (lastMessage?.id)
            updateMessage(lastMessage?.id, { done: true });

        console.log(lastMessage);

        //triggerPendingExecutables();

    }, [active, updateMessage, triggerPendingExecutables]);

    const handleToolResponse = useCallback(async (codeEntry: any) => {
        if (!active) return;

        const toolRes = await sendAction(active.id, codeEntry.code);
        set(codeEntry.id, { state: "EXECUTED" });
        scrollToBottom();

        if (!toolRes) return;

        await sendMessage(
            {
                id: toolRes.id,
                message: toolRes.message,
                sender: "tool",
                time: "",
                chat_id: active.id,
                mock: true,
            },
            (data: string) => {
                const parsed = JSON.parse(data);
                if ("imessage_id" in parsed) {
                    pushMessage({
                        id: parsed.imessage_id,
                        sender: "assistant",
                        message: "",
                        mock: true,
                    });
                } else {
                    const { message_id, chunk } = parsed;
                    appendMessage(message_id, chunk);
                }
                scrollToBottom();
            },
            handleEnd
        );
    }, [active, sendAction, sendMessage, set, appendMessage, pushMessage, scrollToBottom, handleEnd]);

    useEffect(() => {
        if (!active) return;
        triggerPendingExecutables();
    }, [active, triggerPendingExecutables]);

    useEffect(() => {
        if (!active || active.id !== params.slug) {
            fetchChat(params.slug, () => { }).catch(() => router.push("/"));
        }
    }, [params.slug, active, fetchChat, router]);

    useEffect(scrollToBottom, [active, scrollToBottom]);

    const handleSendMessage = useCallback(async (msg: Message) => {
        if (!active) return;

        const handleStream = (data: string) => {
            try {
                const parsed = JSON.parse(data);
                if ("umessage_id" in parsed) {
                    pushMessage({ ...msg, id: parsed.umessage_id });
                    pushMessage({
                        id: parsed.imessage_id,
                        sender: "assistant",
                        message: "",
                        mock: true,
                    });
                } else {
                    const { message_id, chunk } = parsed;
                    appendMessage(message_id, chunk);
                }
                scrollToBottom();
            } catch (e) {
                console.error(e);
            }
        };

        try {
            await sendMessage({ ...msg, chat_id: active.id }, handleStream, handleEnd);
        } catch (err) {
            console.error("Error sending message:", err);
        }
    }, [active, pushMessage, appendMessage, sendMessage, handleEnd, scrollToBottom]);

    return (
        <div className="flex flex-col h-full">
            {active && (
                <MessageList
                    messages={active.messages}
                    messagesEndRef={messagesEndRef}
                />
            )}
            <div className="flex p-1 w-full shadow-lg justify-center bg-background">
                <ChatBox sendMessage={handleSendMessage} />
            </div>
        </div>
    );
};
