import { report_error, request } from "@/utils/request";
import { create, StateCreator } from "zustand";
import { Message } from "./message";
import { createTabSlice, TabStore } from "./tab"
import { createTaskSlice, TaskStore } from "./task"
import { createSandboxSlice, SandboxStore } from "./sandbox"
import { ReactRender } from "@/utils/react2";
import { ArrayStore, createArraySlice } from "./array";

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    starred: boolean;
    selected: boolean;
    tasks: any[];
    sandbox: any;
}


export interface ChatStore {
    chats: Chat[];
    active: Chat | null;
    streaming: boolean;
    setStreaming: (streaming: boolean) => void;
    createChat: (message: Message) => Promise<Chat>;
    setChats: (id: string, data: any) => void;
    setActive: (id: string) => void;
    fetchChats: () => void;
    refreshChat: () => void;
    fetchChat: (id: string, end: (active: Chat) => void) => Promise<any>;
    sendAction: (chat_id: string, code: string) => Promise<Message>;
    deleteChats: (id: string) => Promise<void>;
    getMessage: (id: string) => Message;
    pushMessage: (message: Message) => void;
    updateMessage: (message_id: string, data: any) => void;
    appendMessage: (message_id: string, message: string) => void;
    sendMessage: (
        msg: Record<string, any>,
        res: (data: string) => void,
        body: (id: string, data: string) => void,
        end: (data: any) => void
    ) => Promise<void>;
    sendMessageWrap: (msg: Partial<Message>) => Promise<string>;
    starChats: (id: string, star: boolean) => void;
    branchMessage: (msg: Partial<Message>) => void;
    editMessage: (msg: Partial<Message>) => void;
    setController: (controller: AbortController) => void;
    abortController: () => void;
}

const createChatSlice: StateCreator<ChatStore> = (set, get) => {

    let controllerRef: AbortController | null = null;

    return {
        active: null,
        chats: [],
        streaming: false,
        setStreaming: (streaming: boolean) => set({ streaming }),
        setActive: (id: string) => {
            const chat = get().chats.find((chat: Chat) => chat.id == id);
            set({ active: chat })
        },
        setController: (controller: AbortController) => {
            controllerRef = controller;
        },
        abortController: () => {
            if (controllerRef) {
                set({ streaming: false });
                controllerRef.abort();
                controllerRef = null;
            }
        },
        createChat: async (nessage: Message) => {
            try {
                const response = await request.post("chat", nessage);
                await get().fetchChats()
                await get().fetchChat(response.data.id, () => { })

                return response.data
            } catch (e) {
                report_error(e)
                throw e;
            }
        },
        setChats: (id: string, data: Partial<Chat>) => {
            set((state: ChatStore) => ({
                ...state,
                chats: state.chats.map(chat => {
                    if (id === "*") return { ...chat, ...data }; // Update all chats
                    if (id === "s" && chat.selected) return { ...chat, ...data }; // Update only selected chats
                    if (chat.id === id) return { ...chat, ...data }; // Update a specific chat
                    return chat; // Keep unchanged
                }),
            }));
        },
        branchMessage: async (msg: Partial<Message>) => {
            try {
                let active = get().active;
                if (!active) throw new Error("No active chat");
                await request.patch(`chat/branch/${active.id}`, msg);
            } catch (e) {
                report_error(e)
                throw e;
            }
        },
        editMessage: async (msg: Partial<Message>) => {
            try {
                let active = get().active;
                if (!active) throw new Error("No active chat");
                await request.patch(`chat/update/${active.id}`, msg);
            } catch (e) {
                report_error(e)
                throw e;
            }
        },
        sendMessage: async (
            msg: Record<string, any>,
            res: (data: any) => void,
            body: (id: string, data: string) => void,
            end: (data: any) => void
        ) => {
            if (controllerRef) {
                set({ streaming: false });
                controllerRef.abort();
            }

            controllerRef = new AbortController();

            try {
                const params = new URLSearchParams(msg);
                const response = await fetch(`https://api.dafifi.net/chat/prompt?${params.toString()}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    signal: controllerRef.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) return;

                let header = null;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        controllerRef = null;
                        end(header);

                        if ("transient" in msg && msg.transient) {

                        } else {
                            let _msg = get().getMessage(header.imessage_id);
                            new ReactRender(_msg, header.chat_id, true).run();
                        }

                        return;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    for (const line of chunk.split("\n")) {
                        if (line.startsWith("data: ")) {
                            const data = line.replace(/^data: /, "").trim();

                            if (data !== "") {
                                const json = JSON.parse(data);

                                if ("chat_id" in json) {
                                    header = json;
                                    await res(header);
                                } else {
                                    const { message_id, chunk } = json;
                                    if (chunk !== "[DONE]\n") body(message_id, chunk);
                                }
                            }
                        }
                    }
                }
            } catch (e: any) {
                if (e.name === "AbortError") {
                    end({ aborted: true });
                    return;
                }
                throw e;
            }
        },
        sendMessageWrap: async (msg: Partial<Message>) => {
            let active = get().active;

            if (!active) return "";

            const handleHeader = async (data: any) => {
                const { pushMessage } = get();

                if (!pushMessage) throw new Error("No pushMessage");

                pushMessage({
                    ...msg,
                    id: data.umessage_id,
                    createdAt: data.ucreated_at
                });

                pushMessage({
                    id: data.imessage_id,
                    sender: "assistant",
                    message: "",
                    createdAt: data.icreated_at
                });
            };

            try {
                set({ streaming: true });

                await get().sendMessage(
                    { ...msg, chat_id: active.id },
                    handleHeader,
                    (message_id: string, message: string) => {
                        get().appendMessage(message_id, message);
                    },
                    () => { }
                );

                return "success";
            } catch (err) {
                console.error("Error sending message:", err);
                return "error";
            } finally {
                set({ streaming: false });
            }
        },
        sendAction: async (chat_id: string, code: string): Promise<Message> => {
            try {
                const response = await request.post("/action", { chat_id, code });
                get().pushMessage(response.data)
                return response.data
            } catch (e: any) {
                report_error(e)
                return {
                    id: "id",
                    message: e.message,
                    sender: "tool",
                    chat_id,
                    createdAt: e.createdAt
                };
            }
        },
        getMessage: (id: string): Message | undefined => {
            let active = get().active;

            if (!active) throw new Error("No active chat");

            return active.messages.find((msg: Message) => msg.id == id);
        },
        pushMessage: (message: Message) => {
            let active = get().active;

            if (!active) throw new Error("No active chat");

            active.messages = [...active.messages, message];
            set({ active })
        },
        updateMessage: (message_id: string, data: Partial<Message>) => {
            const active = get().active;
            if (!active?.messages) return;

            const nmsgs = active.messages.map((msg: Message) =>
                msg.id === message_id ? { ...msg, ...data } : msg
            );

            set({
                active: {
                    ...active,
                    messages: nmsgs,
                },
            });
        },
        appendMessage: (message_id: string, message: string) => {
            const active = get().active;
            if (!active) return;

            const updatedMessages = active.messages.map((msg: Message) =>
                msg.id === message_id
                    ? { ...msg, done: false, message: msg.message + message }
                    : msg
            );

            set({
                active: {
                    ...active,
                    messages: updatedMessages
                }
            });
        },
        fetchChats: async () => {
            try {
                const response = await request.get(`chat`);
                set({ chats: response.data })

                let active = get().active;
                if (!active) throw new Error("No active chat");

                await get().fetchChat(active.id, () => { })

            } catch (e) {
                report_error(e)
            }
        },
        fetchChat: async (id: string, end: (active: Chat) => void): Promise<any> => {
            try {
                const response = await request.get(`chat/${id}`);

                set({ active: response.data })

                let active = get().active;
                if (!active) throw new Error("No active chat");

                await end(active);
            } catch (e) {
                report_error(e)
                throw e;
            }
        },
        refreshChat: async (): Promise<any> => {
            if (!get().active) return;

            let active = get().active;
            if (!active) throw new Error("No active chat");

            await get().fetchChat(active.id, () => { })
        },
        deleteChats: async (id: string) => {
            let chats;
            if (id == "s")
                chats = get().chats.filter((chat: Chat) => chat.selected);
            else
                chats = get().chats.filter((chat: Chat) => chat.id === id)

            if (!chats) return;

            let chat_ids = chats.map((chat: Chat) => chat.id);

            try {
                const response = await request.post("chat/delete", {
                    chat_ids
                });

                await get().fetchChats()
            } catch (e) {
                report_error(e)
            }
        },
        starChats: async (id: string, star: boolean) => {
            let chats;
            if (id == "s")
                chats = get().chats.filter((chat: Chat) => chat.selected);
            else
                chats = get().chats.filter((chat: Chat) => chat.id === id)

            if (!chats) return;

            let chat_ids = chats.map((chat: Chat) => chat.id);

            try {
                const response = await request.post("chat/star", {
                    chat_ids,
                    star
                });

                await get().fetchChats()
            } catch (e) {
                report_error(e)
            }
        }
    }
}

export const useChatsStore = create<
    ChatStore & TabStore & TaskStore & ArrayStore & SandboxStore
>((...a) => ({
    ...createChatSlice(...a),
    ...createTabSlice(...a),
    ...createTaskSlice(...a),
    ...createSandboxSlice(...a),
    ...createArraySlice(...a)
}))