import { Chat, useChatsStore } from "@/store/chats";
import { ChatBox } from "../chat/chat-box";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
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
        active,
    } = useChatsStore();

    const handleSendMessage = useCallback(async (msg: Message) => {

        let headerHandled = false;

        const handleStream = async (data: string) => {
            try {
                const parsed = JSON.parse(data);
                if (!headerHandled) {
                    await fetchChat(parsed.chat_id);
                    router.push(`/c/${parsed.chat_id}`);
                    headerHandled = true;
                } else {
                    const { message_id, chunk } = parsed;
                    updateMessage(message_id, chunk);
                }
            } catch (e) {
                console.log(e)
            }

        };

        const handleEnd = async (active: Chat) => {
            if (!active) return;

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
                        },
                        () => { }
                    );
                })
            }
        };

        try {
            await sendMessage(
                { ...msg, chat_id: "new" },
                handleStream,
                handleEnd
            );
        } catch (err) {
            console.error("Error sending message:", err);
        }
    }, [active, pushMessage, updateMessage, sendAction, sendMessage, fetchChat]);

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
