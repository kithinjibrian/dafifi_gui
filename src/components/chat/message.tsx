import { Avatar, AvatarFallback } from "../ui/avatar";
import { ReactRender } from "@/utils/react2";
import { ScrollArea } from "../ui/scroll-area";
import { Message as MessageTYpe } from "@/store/message";

export const Message = ({ message, isGrouped }: { message: MessageTYpe }) => {
    const { react } = new ReactRender(message).run();

    return (
        <>
            <div
                className={`${isGrouped ? 'mt-1' : ''} ${message.sender === "user"
                    ? "bg-sky-700 text-foreground"
                    : "bg-card text-foreground"
                    } rounded-3xl py-4 px-4 relative min-w-40`}
            >
                {react}
                <div className="text-xs text-gray-300 text-right mt-1">
                    {message.time}
                </div>
            </div>
        </>
    );
};

export const MessageGroup = ({ group }) => {
    return (
        <div className="mb-2 md:mb-4 w-full">
            <div className={`flex ${group.sender === "user" ? "justify-end" : "justify-start"}`}>
                {/* Profile pic for "them" messages */}
                {group.sender === "assistant" && (
                    <Avatar className="mr-2">
                        <AvatarFallback className="bg-indigo-500">AI</AvatarFallback>
                    </Avatar>
                )}

                {group.sender === "tool" && (
                    <Avatar className="mr-2">
                        <AvatarFallback className="bg-orange-500">TL</AvatarFallback>
                    </Avatar>
                )}

                {/* Message bubbles */}
                <div className="max-w-3xl">
                    {group.messages.map((msg, msgIndex) => (
                        <Message
                            key={msg.id}
                            message={msg}
                            isGrouped={msgIndex !== 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const MessageList = ({ messages, messagesEndRef }) => {
    // Group messages by sender
    const groupMessages = (messages) => {
        const grouped = [];
        let currentGroup = null;

        messages.forEach(msg => {
            // Start a new group if this is the first message or sender changed
            if (!currentGroup || currentGroup.sender !== msg.sender) {
                if (currentGroup) {
                    grouped.push(currentGroup);
                }
                currentGroup = {
                    sender: msg.sender,
                    messages: [msg]
                };
            } else {
                // Add to existing group
                currentGroup.messages.push(msg);
            }
        });

        // Add the last group
        if (currentGroup) {
            grouped.push(currentGroup);
        }

        return grouped;
    };

    const groupedMessages = groupMessages(messages);

    return (
        <ScrollArea className="flex-1 h-[85vh] md:h-full w-full p-4">
            {groupedMessages.map((group, index) => (
                <MessageGroup
                    key={index}
                    group={group}
                />
            ))}
            <div className="py-10"></div>
            <div ref={messagesEndRef} />
        </ScrollArea>

    );
};