import { Avatar, AvatarFallback } from "../ui/avatar";
import { ReactRender } from "@/utils/react2";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useReducer, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { time } from "@/utils/time";
import Link from "next/link";
import { Copy, Pencil, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "../ui/button";
import { ChatBox } from "./chat-box";
import { useChatsStore } from "@/store/chats";
import { Message as MessageType } from "@/store/message";
import { open_extras } from "../utils/extras";
import { useTextStore } from "@/store/text";

function reducer(state, action) {
    switch (action.type) {
        case 'hideCode':
            const updatedHideCode = [...state.hideCode];
            updatedHideCode[action.index] = !updatedHideCode[action.index];
            return { ...state, hideCode: updatedHideCode };
        case 'Loading': {
            const updatedLoading = state.loading.map(row => row ? [...row] : []);

            if (!updatedLoading[action.x]) {
                updatedLoading[action.x] = [];
            }

            if (updatedLoading[action.x][action.y] === undefined) {
                updatedLoading[action.x][action.y] = false;
            }

            updatedLoading[action.x][action.y] = !updatedLoading[action.x][action.y];

            return { ...state, loading: updatedLoading };
        }

        default:
            return state;
    }
}

export const Message = ({ message, isGrouped }: { message: MessageType; isGrouped: boolean }) => {
    const isMobile = useIsMobile();
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [renderedComponents, setRenderedComponents] = useState([]);
    const [store, dispatch] = useReducer(reducer, { hideCode: [], loading: [[], []] });
    const { write } = useTextStore();

    const {
        active,
        fetchChat,
        sendMessageWrap,
        branchMessage
    } = useChatsStore();

    if (!active) return <></>

    useEffect(() => {
        let a = async () => {
            const { react } = await new ReactRender(
                message,
                active.id,
                false,
                {
                    mobile: [isMobile, () => { }],
                    hideCode: [store.hideCode, (index: number) => dispatch({ type: 'hideCode', index })],
                    loading: [store.loading, (x: number, y: number) => dispatch({ type: 'Loading', x, y })]
                }
            ).run();
            setRenderedComponents(react);
        };
        a();
    }, [message, isMobile, store]);

    return (
        <div
            id={message.id}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isEditing ? (
                <div>
                    <ChatBox
                        initMessage={message.message}
                        sendMessage={async (msg: MessageType) => {

                            await branchMessage({
                                id: message.id,
                            });

                            await fetchChat(active.id, () => { });

                            await sendMessageWrap({
                                sender: "user",
                                message: msg.message
                            });

                            setIsEditing(false)
                        }}
                        handleCancel={() => setIsEditing(false)}>
                    </ChatBox>
                </div>
            ) : (
                <div
                    className={`${isGrouped ? 'mt-1' : ''} ${message.sender === 'user'
                        ? 'bg-sky-700 text-foreground'
                        : 'bg-card text-foreground'
                        } rounded-3xl py-4 px-4 relative min-w-40`}>
                    {renderedComponents}
                    <div className="text-xs text-gray-300 text-right mt-1">
                        {time(message.createdAt)}
                    </div>
                </div>
            )}


            {message.sender === "user" && (
                <div className="flex justify-end">
                    {(isHovered && !isEditing) ? (
                        <>
                            <Button
                                variant={"ghost"}
                                onClick={() => {

                                }}>
                                <Copy />
                            </Button>
                            <Button
                                variant={"ghost"}
                                onClick={() => setIsEditing(true)}>
                                <Pencil />
                            </Button>
                        </>
                    ) : (
                        <Button variant={"ghost"}></Button>
                    )}
                </div>
            )}

            {message.sender === "assistant" && (
                <div className="flex justify-start">
                    <Button
                        variant={"ghost"}
                        onClick={() => {

                        }}>
                        <Copy />
                    </Button>
                    <Button
                        variant={"ghost"}
                        onClick={() => {
                            write(message);

                            open_extras(isMobile, {
                                menu: "Code",
                            })
                        }}>
                        <Pencil />
                    </Button>
                    <Button
                        variant={"ghost"}
                        onClick={() => {

                        }}>
                        <ThumbsUp />
                    </Button>
                    <Button
                        variant={"ghost"}
                        onClick={() => {

                        }}>
                        <ThumbsDown />
                    </Button>
                </div>
            )}
        </div>
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