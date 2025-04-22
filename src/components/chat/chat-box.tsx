import { useRef, useState } from "react";
import { Switch } from "@/components/ui/switch"
import { Label } from "../ui/label";

export const ChatBox = ({ sendMessage }) => {
    const [newMessage, setNewMessage] = useState("");
    const textareaRef = useRef(null);
    const [loading, setLoading] = useState(true)
    const [mock, setMock] = useState(true)
    const [run, setRun] = useState(true)

    const handleSend = () => {
        if (newMessage.trim() === "") return;

        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ":" +
            now.getMinutes().toString().padStart(2, '0');

        const result = sendMessage({
            message: `p{ "${JSON.stringify(newMessage)}" }`,
            sender: "user",
            time: time,
            mock
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
        <div className="bg-card w-full rounded-4xl p-2 flex flex-col gap-2">
            {/* Top Row: Textarea + Send Button */}
            <div className="flex flex-row items-end w-full gap-2">
                {/* Text Input Area */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleTextareaChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type an instruction"
                        className="w-full py-2 px-4 pr-12 rounded-lg focus:outline-none resize-none overflow-auto"
                        style={{ height: "40px", maxHeight: "300px", minHeight: "40px" }}
                        rows={1}
                    />
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-700 focus:outline-none mb-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Bottom Row: Toggle */}
            <div className="flex justify-start p-2 gap-2">
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={run}
                        onCheckedChange={setRun}
                        id="run" />
                    <Label htmlFor="run">{
                        run ? "Run manually" : "Run automatically"
                    }</Label>
                </div>
            </div>
        </div>
    );
}