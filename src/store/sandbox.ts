import { StateCreator } from "zustand";
import { report_error, request } from "@/utils/request";

export interface SandboxStore {
    createSandbox: (chat_id: string) => Promise<void>
}

export const createSandboxSlice: StateCreator<
    SandboxStore,
    [],
    [],
    SandboxStore
> = (set: any, get: any) => ({
    createSandbox: async (chat_id: string) => {
        try {
            const response = await request.post(`/sandbox/start`, {
                chat_id
            });
            get().refreshChat();
        } catch (e) {
            report_error(e)
        }
    }
})