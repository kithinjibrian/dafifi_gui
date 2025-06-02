import { report_error, request } from "@/utils/request";
import { create } from "zustand";
import { useChatsStore } from "./chats";

export interface Message {
    id: string;
    sender: string;
    message: string;
    chat_id?: string;
    createdAt?: string;
    transient?: boolean;
    edit?: boolean
}

export const useMessageStore = create<any>((set, get) => ({
    saveMessage: async (message: Message) => {
        try {
            const { active, refreshChat } = useChatsStore.getState();

            if (!active) throw new Error("No active chat");

            await request.post(`message`, {
                ...message,
                chat_id: active.id
            });

            await refreshChat();
        } catch (e) {
            report_error(e)
            throw e;
        }
    }
}))