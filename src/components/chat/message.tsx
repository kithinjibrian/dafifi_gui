import { md_render } from "@kithinji/md";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ReactExtension } from "@/utils/react";

export const Message = ({ message, isGrouped }) => {
    const context = md_render(message.message, new ReactExtension())
    return (
        <>
            <div
                className={`${isGrouped ? 'mt-1' : ''} ${message.sender === "user"
                    ? "bg-sky-700 text-foreground"
                    : "bg-card text-foreground"
                    } rounded-3xl py-2 px-4 relative min-w-40`}
            >
                {context.result}
                <div className="text-xs text-gray-300 text-right mt-1">
                    {message.time}
                </div>
            </div>
        </>
    );
};

export const MessageGroup = ({ group }) => {
    return (
        <div className="mb-4">
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
        <div className="flex-1 overflow-y-auto p-4 bg-background">
            {groupedMessages.map((group, index) => (
                <MessageGroup
                    key={index}
                    group={group}
                />
            ))}
            <div className="py-10"></div>
            <div ref={messagesEndRef} />
        </div>
    );
};