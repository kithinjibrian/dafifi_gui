import { report_error, request } from "@/utils/request";
import { create, StateCreator } from "zustand";
import { createMessageSlice, Message, MessageStore } from "./message";
import { createTabSlice, TabStore } from "./tab"
import { ReactRender } from "@/utils/react2";

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
    fetchChat: (id: string, end: (active: Chat) => void) => Promise<any>;
    sendAction: (chat_id: string, code: string) => Promise<Message>;
    deleteChats: (id: string) => Promise<void>;
    getMessage: (id: string) => Message;
    pushMessage: (message: Message) => void;
    updateMessage: (message_id: string, data: any) => void;
    appendMessage: (message_id: string, message: string) => void;
    sendMessage: (msg: Message, res: (data: string) => void, end: (data: any) => void) => void;
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
    sendMessage: async (msg: Message, res: (data: any) => void, end: (data: any) => void) => {
        const params = new URLSearchParams(msg);

        const response = await fetch(`https://api.dafifi.net/chat/prompt?${params.toString()}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            }
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
                end(header)

                let msg = get().getMessage(header.imessage_id);
                new ReactRender(msg, header.chat_id, true).run()

                return;
            }

            const chunk = decoder.decode(value, { stream: true });

            for (const line of chunk.split('\n')) {
                if (line.startsWith('data: ')) {
                    const data = line.replace(/^data: /, '').trim();

                    if (data !== "") {
                        try {
                            const json = JSON.parse(data);

                            if ("chat_id" in json) {
                                header = json;
                                await res(header);
                            } else {
                                const { message_id, chunk } = json;
                                if (chunk !== "[DONE]\n")
                                    get().appendMessage(message_id, chunk);
                            }

                        } catch (e) {
                            throw e;
                        }
                    }
                }
            }
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
                chat_id,
                mock: true
            };
        }


    },
    getMessage: (id: string): Message => {
        let active = get().active;

        return active.messages.find((msg: Message) => msg.id == id);
    },
    pushMessage: (message: Message) => {
        let active = get().active;
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
        } catch (e) {
            report_error(e)
        }
    },
    fetchChat: async (id: string, end: (active: Chat) => void): Promise<any> => {
        try {
            const response = await request.get(`chat/${id}`);

            set({ active: response.data })
            await end(get().active);
        } catch (e) {
            report_error(e)
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
    ChatStore & TabStore & MessageStore
>((...a) => ({
    ...createChatSlice(...a),
    ...createMessageSlice(...a),
    ...createTabSlice(...a)
}))


/**
 fetch(`https://api.dafifi.net/chat`, {
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
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            // await end();
                            return;
                        }

                        const chunk = decoder.decode(value, { stream: true });

                        console.log("+++++++++++++++++++")
                        console.log(chunk)

                        // chunk.split("\n").filter(ch => ch !== "").map(async ch => {
                        //     console.log(ch)
                        // })
                        read();
                    });
                }

                read()
            });


            try {
            const res = await fetch(`https://api.dafifi.net/chat`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(msg)
            });

            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    return;
                }

                const chunk = decoder.decode(value, { stream: true });
                console.log("+++++++++++++++++++")
                console.log(chunk)
            }
        } catch (e) {
            report_error(e)
        }
 */