import { report_error, request } from "@/utils/request";
import { StateCreator } from "zustand";

export interface Message {
    id?: string;
    mock: boolean;
    sender: string;
    message: string;
    time?: string;
    chat_id?: string;
    rendered?: boolean;
    done?: boolean;
}

export interface MessageStore {
    patchMessage: (id: string, data: any) => void;
}

export const createMessageSlice: StateCreator<
    MessageStore,
    [],
    [],
    MessageStore
> = (set: any, get: any) => ({
    patchMessage: async (id: string, data: any) => {
        try {
            await request.patch(`message/${id}`, data);
        } catch (e) {
            report_error(e)
            throw e;
        }
    }
})