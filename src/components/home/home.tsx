import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { ChatBox } from "../chat/chat-box";
import { Chat, useChatsStore } from "@/store/chats";
import { Message } from "@/store/message";
import { md_render } from "@kithinji/md";
import { ReactExtension } from "@/utils/react";

export const Home = () => {
    const router = useRouter();
    const {
        sendMessage,
        updateMessage,
        fetchChat,
        pushMessage,
        sendAction,
    } = useChatsStore();

    const handleToolExecution = async (active: Chat) => {

        const lastMessage = active?.messages.at(-1);
        if (!lastMessage || lastMessage.sender !== "assistant") return;

        const context = md_render(lastMessage.message, new ReactExtension());

        for (const c of context.code) {
            const toolRes = await sendAction(active.id, c);
            if (!toolRes) continue;

            await sendMessage(
                {
                    id: toolRes.id,
                    message: toolRes.message,
                    sender: "tool",
                    time: "",
                    chat_id: active.id,
                },
                (data: string) => {
                    try {
                        const parsed = JSON.parse(data);
                        if ("imessage_id" in parsed) {
                            pushMessage({
                                id: parsed.imessage_id,
                                sender: "assistant",
                                message: "",
                            });
                        } else {
                            const { message_id, chunk } = parsed;
                            updateMessage(message_id, chunk);
                        }
                    } catch (e) {
                        console.error("Parsing tool response failed:", e);
                    }
                },
                () => { }
            );
        }
    };

    const handleStreamData = async (data: string) => {
        try {
            const parsed = JSON.parse(data);

            if ("chat_id" in parsed) {
                await fetchChat(parsed.chat_id, handleToolExecution);
                router.push(`/c/${parsed.chat_id}`);
            } else {
                const { message_id, chunk } = parsed;
                updateMessage(message_id, chunk);
            }
        } catch (e) {
            console.error("Error handling streamed data:", e);
        }
    };

    const handleSendMessage = useCallback(
        async (msg: Message) => {
            try {
                await sendMessage(
                    { ...msg, chat_id: "new" },
                    handleStreamData,
                    () => { }
                );
                return "success";
            } catch (err) {
                console.error("Error sending message:", err);
                return "error";
            }
        },
        [sendMessage, handleStreamData]
    );

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <div className="text-center">
                <h1 className="text-3xl font-bold">What can I do for you?</h1>
            </div>
            <div className="mt-4 w-3/4">
                <ChatBox sendMessage={handleSendMessage} />
            </div>
        </div>
    );
};
