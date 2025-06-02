import { create } from "zustand";

export interface CStackStore {
    stack: string[];
    index: number;
    new_message: () => number;
    append: (code: string) => void;
    peek: () => string;
    remove: (i: number) => void;
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
        set(state => {
            const updatedStack = [...state.stack];
            const targetIndex = state.index - 1;
            if (targetIndex >= 0 && targetIndex < updatedStack.length) {
                updatedStack[targetIndex] += code;
            }
            return { stack: updatedStack };
        });
    },
    peek: () => {
        const stack = get().stack;
        return stack[stack.length - 1] || "";
    },
    remove: (i: number) => {
        set(state => {
            if (i < 0 || i >= state.stack.length) return {};
            const newStack = state.stack.filter((_, idx) => idx !== i);
            const newIndex = state.index > i ? state.index - 1 : state.index;
            return {
                stack: newStack,
                index: newIndex
            };
        });
    }
}));
