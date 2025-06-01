import { useRef, useState } from "react";
import { X } from "lucide-react";

type ChatBoxProps = {
    sendMessage: (data: { message: string; sender: string }) => void;
    handleCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    initMessage?: string;
};

export const ChatBox = ({
    sendMessage,
    handleCancel,
    initMessage = ""
}: ChatBoxProps) => {
    const [newMessage, setNewMessage] = useState(initMessage);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleSend = () => {
        if (newMessage.trim() === "") return;

        const result = sendMessage({
            message: `p { \`${newMessage}\` }`, // change to pre once finetuned
            sender: "user",
        });

        setNewMessage("");

        if (textareaRef.current) {
            textareaRef.current.style.height = "40px";
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "40px";
            const scrollHeight = textarea.scrollHeight;

            if (scrollHeight <= 150) {
                textarea.style.height = scrollHeight + "px";
            } else {
                textarea.style.height = "150px";
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-card w-full rounded-4xl p-2 flex flex-col gap-2">
            <div className="flex flex-row items-end w-full gap-2">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyPress}
                        placeholder="Type an instruction"
                        className="w-full py-2 px-4 pr-12 rounded-lg focus:outline-none resize-none overflow-auto"
                        style={{ height: "40px", maxHeight: "300px", minHeight: "40px" }}
                        rows={1}
                        aria-label="Message input"
                    />
                </div>

                <button
                    onClick={handleSend}
                    className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-700 focus:outline-none mb-1"
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>

                {handleCancel !== undefined && (
                    <button
                        onClick={handleCancel}
                        className="bg-red-500 text-white rounded-full p-2 hover:bg-red-700 focus:outline-none mb-1"
                        aria-label="Cancel"
                    >
                        <X />
                    </button>
                )}
            </div>
        </div>
    );
};
