import { useRef, useState } from "react";

export const ChatBox = ({ sendMessage }) => {
    const [newMessage, setNewMessage] = useState("");
    const textareaRef = useRef(null);
    const [loading, setLoading] = useState(true)

    const handleSend = () => {
        if (newMessage.trim() === "") return;

        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ":" +
            now.getMinutes().toString().padStart(2, '0');

        const result = sendMessage({
            message: newMessage,
            sender: "user",
            time: time
        })

        setNewMessage("");

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "40px";
        }

        // Simulate received message after a short delay
        setTimeout(() => {
            const replyTime = new Date();
            const replyTimeStr = replyTime.getHours().toString().padStart(2, '0') + ":" +
                replyTime.getMinutes().toString().padStart(2, '0');
        }, 1500);
    };

    const handleTextareaChange = (e) => {
        setNewMessage(e.target.value);

        // Reset height to get the correct scrollHeight measurement
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "40px";
            const scrollHeight = textarea.scrollHeight;

            // Limit max height to 120px, after which scrolling begins
            if (scrollHeight <= 300) {
                textarea.style.height = scrollHeight + "px";
            } else {
                textarea.style.height = "300px";
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-card w-full rounded-4xl p-2 flex">
            {/* Left side - emoji icon */}
            {/* 
            <div className="self-end mb-2 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div> 
            */}

            {/* Middle - textarea */}
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    className="w-full py-2 px-4 pr-12 focus:outline-none resize-none overflow-auto"
                    placeholder="Type an instruction"
                    style={{ height: "40px", maxHeight: "300px", minHeight: "40px" }}
                    rows={1}
                />
            </div>

            {/* Right side - send button, always aligned at bottom */}
            <div className="self-end mb-2 ml-2">
                <button
                    onClick={handleSend}
                    className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-700 focus:outline-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}