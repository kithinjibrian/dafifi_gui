import { create } from "zustand";

export interface CStackStore {
    stack: string[];
    index: number;
    new_message: () => number;
    append: (code: string) => void;
    peek: () => string;
}

export const useCStackStore = create<CStackStore>((set, get) => ({
    stack: [],
    index: 0,
    new_message: () => {
        const currentIndex = get().index;
        set(state => ({
            stack: [...state.stack, ""],
            index: state.index + 1
        }));
        return currentIndex;
    },
    append: (code: string) => {
        const { stack, index } = get();
        set(() => {
            const updatedStack = [...stack];
            const targetIndex = index - 1;
            if (targetIndex >= 0 && targetIndex < updatedStack.length) {
                updatedStack[targetIndex] += code;
            }
            return { stack: updatedStack };
        });
    },
    peek: () => {
        const stack = get().stack;
        return stack[stack.length - 1] || "";
    }
}));
