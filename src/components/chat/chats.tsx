import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import { useEffect, useState } from "react";
import { MoreVertical, SquareMousePointer, Star, Trash } from "lucide-react";

import { useChatsStore } from "@/store/chats";
import Link from 'next/link';

import { useRouter } from 'next/navigation'
import { ReactRender } from '@/utils/react2';

export const Chats = () => {
    const router = useRouter()

    const { chats, setChats, deleteChats, starChats } = useChatsStore();
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [selectMode, setSelectMode] = useState<boolean>(false);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [starredAll, setStarredAll] = useState<boolean>(false);

    const handleMenuClick = (chatId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents chat selection when clicking the menu
        setOpenMenu(openMenu === chatId ? null : chatId);
    };

    // 🟡 Filtered categories
    const starredChats = chats.filter(chat => chat.starred);
    const recentChats = chats.filter(chat => !chat.starred);

    const _deleteChats = (id: string) => {
        deleteChats(id);
        router.push("/");
    }

    return (
        <div className="h-full w-full">
            {selectMode && (
                <div className="p-3 flex flex-row items-center justify-between border-b">
                    <div className="flex flex-row items-center gap-3">
                        <Checkbox
                            checked={selectAll}
                            onCheckedChange={() => {
                                setChats("*", { selected: !selectAll })
                                setSelectAll(!selectAll)
                            }} />
                        <span>{chats.filter(chat => chat.selected).length} selected</span>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                starChats("s", !starredAll)
                                setStarredAll(!starredAll)
                            }}>
                            <Star size={20} fill={starredAll ? "white" : "none"} />
                        </Button>
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                _deleteChats("s")
                            }}>
                            <Trash size={20} />
                        </Button>
                        <Separator orientation="vertical" />
                        <Button
                            variant={"ghost"}
                            onClick={() => setSelectMode(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
            <ScrollArea className="h-full">
                {/* 🟡 Starred Chats Section */}
                {starredChats.length > 0 && (
                    <>
                        <h2 className="text-gray-400 text-sm px-3 mt-2">Starred</h2>
                        {starredChats.map((chat) => (
                            <ChatItem
                                key={chat.id}
                                chat={chat}
                                activeChat={activeChat}
                                setActiveChat={setActiveChat}
                                selectMode={selectMode}
                                setSelectMode={setSelectMode}
                                openMenu={openMenu}
                                handleMenuClick={handleMenuClick}
                                setChats={setChats}
                                deleteChats={_deleteChats}
                                starChats={starChats}
                            />
                        ))}
                    </>
                )}

                {/* 🟢 Recent Chats Section */}
                {recentChats.length > 0 && (
                    <>
                        <h2 className="text-gray-400 text-sm px-3 mt-4">Recent</h2>
                        {recentChats.map((chat) => (
                            <ChatItem
                                key={chat.id}
                                chat={chat}
                                activeChat={activeChat}
                                setActiveChat={setActiveChat}
                                selectMode={selectMode}
                                setSelectMode={setSelectMode}
                                openMenu={openMenu}
                                handleMenuClick={handleMenuClick}
                                setChats={setChats}
                                deleteChats={_deleteChats}
                                starChats={starChats}
                            />
                        ))}
                    </>
                )}
            </ScrollArea>
        </div>
    );
};

// 🟢 Extracted ChatItem Component for cleaner code
const ChatItem = ({
    chat,
    activeChat,
    setActiveChat,
    openMenu,
    handleMenuClick,
    setChats,
    selectMode,
    setSelectMode,
    deleteChats,
    starChats
}: any) => {

    // 🟡 Toggle Star
    const toggleStar = () => {
        starChats(chat.id, !chat.starred)
    };

    // 🟡 Toggle Selected
    const toggleSelected = () => {
        setSelectMode(true);
        setChats(chat.id, {
            selected: !chat.selected
        })
    };

    const deleteChat = () => {
        deleteChats(chat.id)
    }

    const [react, setReact] = useState([]);

    useEffect(() => {
        const react = new ReactRender(chat.title).run();
        setReact(react);
    }, [])

    return (
        <div
            onClick={() => setActiveChat(chat.id)}
            className={`relative group w-full flex items-center justify-between p-2 rounded cursor-pointer transition
                ${activeChat === chat.id ? "bg-sky-500 text-white" : "hover:bg-gray-800"}`}
        >
            <div className="flex items-center space-x-2 w-full">
                {selectMode && (
                    <Checkbox
                        checked={chat.selected}
                        onCheckedChange={toggleSelected}
                    />
                )}
                <Link href={`/c/${chat.id}`} className="no-underline w-full">
                    {react}
                </Link>
            </div>

            {/* More Options Menu */}
            <DropdownMenu open={openMenu === chat.id} onOpenChange={() => handleMenuClick(chat.id, event)}>
                <DropdownMenuTrigger asChild>
                    <div
                        onClick={(e) => handleMenuClick(chat.id, e)}
                        className="p-1 rounded hover:bg-gray-700 cursor-pointer transition-opacity opacity-50 group-hover:opacity-100"
                    >
                        <MoreVertical size={20} />
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-40 p-1 rounded-lg">
                    <DropdownMenuItem onClick={toggleSelected}>
                        <SquareMousePointer className="mr-2" />
                        Select
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleStar}>
                        <Star className="mr-2" />
                        {chat.starred ? "Unstar" : "Star"}
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={() => alert("Rename Chat")}>
                        <Pencil className="mr-2" />
                        Rename
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500" onClick={deleteChat}>
                        <Trash className="mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
