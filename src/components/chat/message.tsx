import { Avatar, AvatarFallback } from "../ui/avatar";
import { ReactRender } from "@/utils/react2";
import { ScrollArea } from "../ui/scroll-area";
import { Message as MessageTYpe } from "@/store/message";
import { useEffect, useReducer, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { time } from "@/utils/time";

function reducer(state, action) {
    switch (action.type) {
        case 'hideCode':
            const updatedHideCode = [...state.hideCode];
            updatedHideCode[action.index] = !updatedHideCode[action.index];
            return { ...state, hideCode: updatedHideCode };
        default:
            return state;
    }
}

export const Message = ({ message, isGrouped }: { message: MessageTYpe }) => {
    const isMobile = useIsMobile();
    const [react, setReact] = useState([]);
    const [store, dispatch] = useReducer(reducer, { hideCode: []});

    useEffect(() => {
        let a = async () => {
            const { react } = await new ReactRender(
                message,
                "",
                false,
                {
                    mobile: [isMobile, () => { }],
                    hideCode: [store.hideCode, (index) => dispatch({ type: 'hideCode', index })]
                }
            ).run();
            setReact(react);
        }
        a();
    }, [message, isMobile, store]);


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
                    {time(message.createdAt)}
                </div>
            </div>
        </>
    );
};

export const MessageGroup = ({ group }) => {

    const isUser = group.sender === "user";

    const senderAvatars = {
        assistant: { fallback: "AI", className: "bg-indigo-500" },
        tool: { fallback: "TL", className: "bg-orange-500" },
    };

    const avatar = senderAvatars[group.sender];

    return (
        <div className="mb-2 md:mb-4 w-full">
            <div className={`flex ${group.sender === "user" ? "justify-end" : "justify-start"} w-full`}>
                {/* Profile pic for "them" messages */}
                <div className="w-8 flex-shrink-0 mr-2">
                    {!isUser && avatar && (
                        <Avatar>
                            <AvatarFallback className={avatar.className}>
                                {avatar.fallback}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>

                {/* Message bubbles */}
                <div className="max-w-3xl flex flex-col">
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
        <ScrollArea className="flex-1 h-[90%] md:h-[80%] w-full p-4">
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