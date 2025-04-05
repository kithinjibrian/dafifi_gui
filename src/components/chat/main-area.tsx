import { useChatsStore } from "@/store/chats";
import { useParams } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { ChatBox } from "./chat-box";
import { MessageList } from "./message";
import { Message } from "@/store/message";
import { md_render } from "@kithinji/md";
import { ReactExtension } from "@/utils/react";
import { useRouter } from 'next/navigation'

export const MainArea = () => {
    const router = useRouter()

    const params = useParams<{ slug: string }>();
    const {
        active,
        fetchChat,
        sendMessage,
        pushMessage,
        updateMessage,
        sendAction
    } = useChatsStore();

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch chat if not already loaded
    useEffect(() => {
        let a = async (params, active, fetchChat) => {
            if (!active || active.id !== params.slug) {
                try {
                    await fetchChat(params.slug);
                } catch (e) {
                    router.push("/")
                }
            }
        }

        a(params, active, fetchChat)
    }, [params.slug, active, fetchChat]);

    // Auto-scroll on message update
    useEffect(() => {
        scrollToBottom();
    }, [active]);

    const handleSendMessage = useCallback(async (msg: Message) => {
        if (!active) return;

        let headerHandled = false;

        const handleStream = (data: string) => {
            try {
                const parsed = JSON.parse(data);

                if (!headerHandled) {
                    pushMessage({ ...msg, id: parsed.umessage_id });
                    pushMessage({
                        id: parsed.imessage_id,
                        sender: "assistant",
                        message: ""
                    });
                    headerHandled = true;
                } else {
                    const { message_id, chunk } = parsed;
                    updateMessage(message_id, chunk);
                }

                scrollToBottom();
            } catch (e) {
                console.log(e);
            }

        };

        const handleEnd = async () => {
            const lastMessage = active.messages.at(-1);
            if (lastMessage == undefined)
                return;

            const context = md_render(lastMessage?.message, new ReactExtension())

            // TODO: extract code from llm
            if (lastMessage?.sender === "assistant") {
                context.code.map(async (c) => {

                    const toolRes = await sendAction(
                        active.id,
                        c
                    );

                    scrollToBottom();

                    if (!toolRes) return;

                    let toolHeaderHandled = false;

                    await sendMessage(
                        {
                            id: toolRes.id,
                            message: toolRes.message,
                            sender: "tool",
                            time: "",
                            chat_id: active.id,
                        },
                        (data: string) => {
                            const parsed = JSON.parse(data);

                            if (!toolHeaderHandled) {
                                pushMessage({
                                    id: parsed.imessage_id,
                                    sender: "assistant",
                                    message: ""
                                });
                                toolHeaderHandled = true;
                            } else {
                                const { message_id, chunk } = parsed;
                                updateMessage(message_id, chunk);
                            }

                            scrollToBottom();
                        },
                        () => { }
                    );
                })
            }
        };

        try {
            await sendMessage(
                { ...msg, chat_id: active.id },
                handleStream,
                handleEnd
            );
        } catch (err) {
            console.error("Error sending message:", err);
        }
    }, [active, pushMessage, updateMessage, sendAction, sendMessage]);

    return (
        <div className="flex flex-col h-full w-full">
            {active && (
                <MessageList
                    messages={active.messages}
                    messagesEndRef={messagesEndRef}
                />
            )}
            <div className="flex p-2 w-full shadow-lg justify-center bg-background">
                <ChatBox sendMessage={handleSendMessage} />
            </div>
        </div>
    );
};
