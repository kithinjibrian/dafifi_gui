import { StateCreator } from "zustand";
import { report_error, request } from "@/utils/request";

export interface ArrayStore {
    getArrayAll: (chat_id: string) => Promise<any>,
    getArrayOne: (array_id: string) => Promise<any>
}

export const createArraySlice: StateCreator<
    ArrayStore,
    [],
    [],
    ArrayStore
> = (set: any, get: any) => ({
    getArrayAll: async (chat_id: string) => {
        try {
            const response = await request.get(`/array/get_all/${chat_id}`);
            return response.data;
        } catch (e) {
            report_error(e);
            throw e
        }
    },
    getArrayOne: async (array_id: string) => {
        try {
            const response = await request.get(`/array/${array_id}`);
            return response.data;
        } catch (e) {
            report_error(e)
            throw e
        }
    }
})