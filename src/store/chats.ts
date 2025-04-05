import { report_error, request } from "@/utils/request";
import { create, StateCreator } from "zustand";
import { Message } from "./message";
import { createTabSlice, TabStore } from "./tab"

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    starred: boolean;
    selected: boolean;
}

export interface ChatStore {
    chats: Chat[];
    active: Chat | null;
    setChats: (id: string, data: any) => void;
    setActive: (id: string) => void;
    fetchChats: () => void;
    fetchChat: (id: string) => void;
    sendAction: (chat_id: string, code: string) => Promise<Message>;
    deleteChats: (id: string) => Promise<void>;
    pushMessage: (message: Message) => void;
    updateMessage: (message_id: string, message: string) => void;
    sendMessage: (msg: Message, res: (data: string) => void, end: (chat: Chat) => void) => void;
}

const createChatSlice: StateCreator<
    ChatStore,
    [],
    [],
    ChatStore
> = (set: any, get: any) => ({
    active: null,
    chats: [],
    setActive: (id: string) => {
        const chat = get().chats.find((chat: Chat) => chat.id == id);
        set({ active: chat })
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
    sendMessage: async (msg: Message, res: (data: string) => void, end: (chat: Chat) => void) => {
        try {
            fetch(`http://localhost:3000/chat`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(msg)
            }).then((response) => {

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                function read() {
                    reader.read().then(async ({ done, value }) => {
                        if (done) {
                            await end(get().active);
                            return;
                        }

                        const chunk = decoder.decode(value, { stream: true });
                        await res(chunk);
                        read();
                    });
                }

                read()
            });
        } catch (e) {
            report_error(e)
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
                time: "",
                chat_id
            };
        }
    },
    pushMessage: (message: Message) => {
        let active = get().active;
        active.messages = [...active.messages, message];
        set({ active })
    },
    updateMessage: (message_id: string, message: string) => {
        let active = get().active;

        const nmsgs = active.messages.map((msg: Message) => {
            if (msg.id == message_id) {
                msg.message = `${msg.message}${message}`;
            }

            return msg;
        })

        active.messages = nmsgs;

        set({ active })
    },
    fetchChats: async () => {
        try {
            const response = await request.get(`chat`);
            set({ chats: response.data })
        } catch (e) {
            report_error(e)
        }
    },
    fetchChat: async (id: string) => {
        try {
            const response = await request.get(`chat/${id}`);
            set({ active: response.data })
        } catch (e) {
            // report_error(e)
            throw e;
        }
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
})

export const useChatsStore = create<
    ChatStore & TabStore
>((...a) => ({
    ...createChatSlice(...a),
    ...createTabSlice(...a)
}))