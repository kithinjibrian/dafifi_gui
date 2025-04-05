import { report_error, request } from "@/utils/request";
import { StateCreator, StoreApi, UseBoundStore } from "zustand";

export interface FileDTO {
    id: number;
    uuid: string;
    name: string;
    ext?: string;
    type: string;
    path?: string;
    parent?: string;
    children?: FileDTO[];
    store?: UseBoundStore<StoreApi<any>> | null;
}

export interface FileStoreDTO {
    files: FileDTO[];
    fetchFiles: (projectId: number) => Promise<void>;
    createFile: ({ parentId, type, projectId }: { parentId: number, type: string, projectId: number }) => Promise<FileDTO>;
}

export const createFileSlice: StateCreator<
    FileStoreDTO,
    [],
    [],
    FileStoreDTO
> = (set, get) => ({
    files: [],
    fetchFiles: async (projectId: number) => {
        try {
            const response = await request.get(`/project/${projectId}/files`);
            set({ files: response.data.files });
        } catch (e) {
            report_error(e);
        }
    },
    getFile: async () => {

    },
    createFile: async (
        {
            parentId,
            type,
            projectId
        }: {
            parentId: number,
            type: string,
            projectId: number
        }) => {
        try {
            const response = await request.post(`/file`, {
                parentId,
                type: type,
                projectId,
                name: ""
            });

            await get().fetchFiles(projectId);

            return response.data;
        } catch (e) {
            report_error(e);
        }
    },
    updateFile: async ({ id, projectId, data }) => {
        try {
            await request.patch(`/file/${id}`, data);
            await get().fetchFiles(projectId);
        } catch (e) {
            report_error(e);
        }
    }
})