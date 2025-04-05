import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TooltipComponent } from "../utils/tooltip";
import { MessageCircle, Plus } from "lucide-react";
import { NewChat } from "./new-chat";
import { Chats } from "./chats";
import { useChatsStore } from "@/store/chats";

const navItems = [
    { value: 'New Chat', icon: Plus, content: NewChat },
    { value: 'Chats', icon: MessageCircle, content: Chats },
]

export const NavBar = () => {
    const { activeTab, setActiveTab } = useChatsStore();

    const renderNavItems = () =>
        navItems.map((item) => (
            <TabsTrigger
                value={item.value}
                key={item.value}
                className="bg-background w-full border-l-4 border-l-transparent data-[state=active]:border-l-sky-900 data-[state=active]:shadow-none">
                <TooltipComponent side="right" description={item.value}>
                    <item.icon size={30} strokeWidth={2} />
                </TooltipComponent>
            </TabsTrigger>
        ));

    const renderTabContents = () =>
        navItems.map((item) => (
            <TabsContent className="m-0 p-0 h-full" value={item.value} key={item.value}>
                {item.content && <item.content />}
            </TabsContent>
        ));

    return (
        <div>
            <Tabs
                orientation="vertical"
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex flex-row gap-0 h-[calc(100vh-40px)] w-full">
                <div className="h-full border-x w-16">
                    <TabsList className="m-0 p-0 flex flex-col items-start h-30 w-full">
                        {renderNavItems()}
                    </TabsList>
                </div>
                <div className="flex-1">
                    {renderTabContents()}
                </div>
            </Tabs>
        </div>
    );
};
