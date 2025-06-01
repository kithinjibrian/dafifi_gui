import { Button } from '@/components/ui/button';
import { PanelRef } from '@/components/utils/extras';
import { useChatsStore } from '@/store/chats';
import { useCodeStore } from '@/store/code';
import { useTextStore } from '@/store/text';
import { ASTToLML } from '@/utils/ast2lml';
import { ASTNode, StringNode } from '@kithinji/lml';
import MonacoEditor from '@monaco-editor/react';
import { Play, Save } from 'lucide-react';
import { RefObject, useState } from 'react';

export const EditorBtns = (args: {
    panelRef?: RefObject<PanelRef | null>,
    isMobile?: boolean,
    setOpen?: (open: boolean) => void
}) => {
    if (!args) return null;

    const { panelRef, isMobile, setOpen } = args;
    const { push, exec } = useCodeStore();
    const { text } = useTextStore();
    const { editMessage, refreshChat } = useChatsStore();

    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    if (!text) return null;

    const collapsePanel = () => {
        if (isMobile) {
            setOpen && setOpen(false);
        } else {
            if (panelRef?.current) {
                panelRef.current.collapse();
            }
        }
    };

    const handleSave = async (collapse: boolean = true) => {
        setIsSaving(true);

        try {
            text.node.body.body.forEach((a: ASTNode) => {
                if (a instanceof StringNode) {
                    a.value = text.message;
                }
            });

            const lml = new ASTToLML(text.ast).run();

            const new_text = {
                ...text,
                message: lml,
                old_message: text.message
            };

            await editMessage({
                id: new_text.id,
                message: new_text.message,
            });

            await refreshChat();

            if (collapse) {
                collapsePanel();
            }

            return new_text;
        } finally {
            setIsSaving(false);
        }
    };

    const handleRun = async () => {
        setIsRunning(true);

        try {
            const text = await handleSave(false);

            if (text) {
                push({
                    code: text.message,
                    node: text.node
                });

                await exec(text.chat_id, text.id!);
            }
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <>
            {text.runnable && (
                <Button
                    className="rounded-full"
                    variant="ghost"
                    onClick={handleRun}
                    disabled={isRunning || isSaving}
                >
                    {isRunning ? (
                        <>Running...</>
                    ) : (
                        <>
                            Run
                            <Play />
                        </>
                    )}
                </Button>
            )}
            <Button
                className="rounded-full"
                variant="ghost"
                onClick={async () => {
                    await handleSave();
                }}
                disabled={isRunning || isSaving}
            >
                {isSaving ? (
                    <>Saving...</>
                ) : (
                    <>
                        Save
                        <Save />
                    </>
                )}
            </Button>
        </>
    );
};

export const Editor = () => {
    const { text, write } = useTextStore();

    if (!text) return <div className="p-4 text-gray-500">No code to edit</div>;

    return (
        <div className='h-full'>
            <MonacoEditor
                height="98%"
                language={"text"}
                value={text.message}
                onChange={(value: string | undefined) => {
                    if (value) {
                        write({
                            ...text,
                            message: value
                        });
                    }
                }}
                theme="vs-dark"
            />
        </div>
    )
}