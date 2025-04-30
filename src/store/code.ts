import { create } from "zustand";
import { nanoid } from "nanoid"
import { request } from "@/utils/request";
import { useChatsStore } from "./chats";

interface Code {
    id: string,
    code: string,
    state: "PENDING" | "EXECUTED" | "CRASHED"
}

export interface CodeStore {
    entries: Code[],
    push: (snippets: string[]) => void,
    exec: (chat_id: string) => void,
    get: <K extends keyof Code>(q: { key: K, value: any }) => Code[],
    set: (id: string, value: Partial<Code>) => void,
}

export const useCodeStore = create<CodeStore>((set, get) => ({
    entries: [],
    push: (snippets: string[]) => {
        const n = [...get().entries, ...snippets.map(s => {
            return {
                id: nanoid(),
                code: s,
                state: "PENDING"
            } as Code;
        })];

        set({ entries: n });
    },
    exec: (chat_id: string) => {
        get().entries.map(async entry => {
            try {
                const response = await request.post("/action", { chat_id, code: entry.code });

                const pushMessage = useChatsStore.getState().pushMessage;
                const sendMessage = useChatsStore.getState().sendMessage;

                pushMessage(response.data);

                await sendMessage({
                    id: response.data.id,
                    message: response.data.message,
                    sender: "tool",
                    chat_id
                },
                    (header: any) => {
                        pushMessage({
                            id: header.imessage_id,
                            sender: "assistant",
                            message: ""
                        });
                    },
                    () => { }
                );

            } catch (e) {
                throw e;
            }
        })

        set({ entries: [] });
    },
    get: <K extends keyof Code>(q: { key: K, value: any }) => {
        return get().entries.filter(c => c[q.key] == q.value);
    },
    set: (id: string, value: Partial<Code>) => {
        const updated = get().entries.map(c =>
            c.id === id ? { ...c, ...value } : c
        );
        set({ entries: updated });
    }
}));