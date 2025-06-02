import { use, useCallback } from "react";
import { useRouter } from "next/navigation";

import { ChatBox } from "../chat/chat-box";
import { useChatsStore } from "@/store/chats";
import { Message, useMessageStore } from "@/store/message";
import { useCStackStore } from "@/store/cstack";

export const Home = () => {
    const router = useRouter();
    const {
        sendMessage,
        appendMessage,
        fetchChat,
        setStreaming,
        createChat
    } = useChatsStore();

    const { saveMessage } = useMessageStore();

    const { append, new_message } = useCStackStore();

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

    const handleSaveMessage = useCallback(
        async (msg: Message) => {
            if (msg.sender == "user") {
                // first message
                let chat = await createChat(msg);
                router.push(`/c/${chat.id}`);
            } else if (msg.sender == "assistant") {
                // subsequent assistant message
                await saveMessage(msg);
            }
        },
        [saveMessage]
    )

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <div className="text-center">
                <h1 className="text-3xl font-bold">What can I do for you?</h1>
            </div>
            <div className="mt-4 w-3/4">
                <ChatBox
                    sendMessage={handleSendMessage}
                    onTyping={async (msg: any) => {
                        if (msg.message == "") return;

                        setStreaming(true);

                        new_message();

                        await sendMessage(
                            { ...msg, transient: true },
                            () => { },
                            (message_id: string, message: string) => {
                                append(message);
                            },
                            () => { }
                        );

                        setStreaming(false);
                    }}
                    saveMessage={handleSaveMessage}
                />
            </div>
        </div>
    );
};
