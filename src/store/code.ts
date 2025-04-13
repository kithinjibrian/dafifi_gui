import { create } from "zustand";
import { nanoid } from "nanoid"

interface Code {
    id: string,
    code: string,
    state: "PENDING" | "EXECUTED" | "CRASHED"
}

export interface CodeStore {
    code: Code[],
    push: (snippets: string[]) => void,
    get: <K extends keyof Code>(q: { key: K, value: any }) => Code[],
    set: (id: string, value: Partial<Code>) => void,
}

export const useCodeStore = create<CodeStore>((set, get) => ({
    code: [],
    push: (snippets: string[]) => {
        const n = [...get().code, ...snippets.map(s => {
            return {
                id: nanoid(),
                code: s,
                state: "PENDING"
            } as Code;
        })];

        set({ code: n });
    },
    get: <K extends keyof Code>(q: { key: K, value: any }) => {
        return get().code.filter(c => c[q.key] == q.value);
    },
    set: (id: string, value: Partial<Code>) => {
        const updated = get().code.map(c =>
            c.id === id ? { ...c, ...value } : c
        );
        set({ code: updated });
    }
}));