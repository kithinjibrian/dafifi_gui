import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { ChatBox } from "../chat/chat-box";
import { useChatsStore } from "@/store/chats";
import { Message } from "@/store/message";

export const Home = () => {
    const router = useRouter();
    const {
        sendMessage,
        appendMessage,
        fetchChat,
        setStreaming
    } = useChatsStore();

    const handleHeader = async (data: any) => {
        try {
            await fetchChat(data.chat_id, () => { });
            router.push(`/c/${data.chat_id}`);
        } catch (e) {
            console.error("Error handling streamed data:", e);
        }
    };

    const handleSendMessage = useCallback(
        async (msg: Message) => {
            try {
                setStreaming(true);

                await sendMessage(
                    { ...msg, chat_id: "new" },
                    handleHeader,
                    (message_id: string, message: string) => {
                        appendMessage(message_id, message);
                    },
                    () => { }
                );

                return "success";
            } catch (err) {
                console.error("Error sending message:", err);
                return "error";
            } finally {
                setStreaming(false);
            }
        },
        [sendMessage]
    );

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <div className="text-center">
                <h1 className="text-3xl font-bold">What can I do for you?</h1>
            </div>
            <div className="mt-4 w-3/4">
                <ChatBox
                    sendMessage={handleSendMessage}
                />
            </div>
        </div>
    );
};
