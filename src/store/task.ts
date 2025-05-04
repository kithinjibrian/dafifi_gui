import { StateCreator } from "zustand";
import { report_error, request } from "@/utils/request";

export interface TaskStore {
}

export const createTaskSlice: StateCreator<
    TaskStore,
    [],
    [],
    TaskStore
> = (set: any, get: any) => ({
    updateTask: async (chat_id: string, data: any) => {
        try {
            const response = await request.patch(`/task/${chat_id}`, data);
            get().fetchChats();
        } catch(e) {
            report_error(e)
        }
    }
})