import { useChatsStore } from "@/store/chats";
import { MessageList } from "./message";
import { useCallback, useEffect, useRef } from "react";
import { ChatBox } from "./chat-box";
import { useParams, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { open_extras } from "../utils/extras";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";


export const MainArea = ({ panelRef }: { panelRef: React.RefObject<any> | null }) => {
    const isMobile = useIsMobile();
    const router = useRouter();
    const params = useParams<{ slug: string }>();

    const {
        active,
        fetchChat,
        sendMessageWrap
    } = useChatsStore();

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const el = document.getElementById(hash.substring(1)); // remove "#"
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, []);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (active?.messages) {
            scrollToBottom();
        }
    }, [active?.messages, scrollToBottom]);

    useEffect(() => {
        if (!active || active.id !== params.slug) {
            fetchChat(params.slug, () => { }).catch(() => router.push("/"));
        }
    }, [params.slug, active, fetchChat, router]);

    return (
        <div className="relative flex flex-col h-[95%] md:h-full w-full pt-10 md:pt-2">
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    onClick={() => {
                        open_extras(isMobile, {
                            menu: "Editor",
                            save: () => { },
                        })
                    }}>
                    <Menu />
                </Button>
            </div>
            {active && (
                <MessageList
                    messages={active.messages}
                    messagesEndRef={messagesEndRef}
                />
            )}
            <div className="fixed bottom-0 md:relative w-full flex flex-col p-1 shadow-lg items-center bg-background">
                <ChatBox sendMessage={sendMessageWrap} />
                <div className="flex m-2">
                </div>
            </div>
        </div>
    );
}