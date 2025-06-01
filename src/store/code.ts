import { create } from "zustand";
import { request } from "@/utils/request";
import { useChatsStore } from "./chats";
import { ASTNode, AttributeNode, IdentifierNode, LmlASTNodeBase, StringNode } from "@kithinji/lml";

interface Code {
    code: string,
    node?: LmlASTNodeBase,
}

export interface CodeStore {
    entries: Code[],
    push: ({ code, node }: { code: string, node?: LmlASTNodeBase }) => void,
    exec: (chat_id: string, message_id: string) => Promise<boolean>
}

export const useCodeStore = create<CodeStore>((set, get) => ({
    entries: [],
    push: ({ code, node }: { code: string, node?: LmlASTNodeBase }) => {
        const n = [...get().entries, { code, node }];
        set({ entries: n });
    },
    exec: async (chat_id: string, message_id: string) => {
        let altered = false;

        for (const entry of get().entries) {
            try {
                const response = await request.post("/action", { chat_id, message_id, code: entry.code });

                if (entry.node && entry.node.attributes) {
                    let ffilename = false;
                    entry.node.attributes.attributes.forEach((attr: AttributeNode) => {
                        if (attr.key.name === "filename") {
                            ffilename = true;
                        }
                    })

                    if (!ffilename) {
                        altered = true;
                        entry.node.attributes.attributes.push(new AttributeNode(
                            new IdentifierNode("filename"),
                            new StringNode(response.data.filename)
                        ));
                    }
                }

                const { pushMessage, appendMessage, sendMessage } = useChatsStore.getState();

                pushMessage(response.data.data);

                await sendMessage({
                    id: response.data.data.id,
                    message: response.data.data.message,
                    sender: "tool",
                    chat_id
                },
                    (header: any) => {
                        pushMessage({
                            id: header.imessage_id,
                            sender: "assistant",
                            message: "",
                            createdAt: header.icreated_at
                        });
                    },
                    (message_id: string, message: string) => {
                        appendMessage(message_id, message);
                    },
                    () => { }
                );
            } catch (e) {
                throw e;
            }
        }

        set({ entries: [] });

        return altered;
    },
}));